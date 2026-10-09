const Document = require('../models/Document');

// @desc    Get dashboard metrics & expiry stats for user
// @route   GET /api/stats/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const documents = await Document.find({ user: userId });

    let total = documents.length;
    let valid = 0;
    let expiringSoon = 0;
    let expired = 0;
    let lifetime = 0;
    let expiringIn7Days = 0;
    let expiringIn30Days = 0;
    let expiringIn90Days = 0;
    let totalSizeBytes = 0;

    const categoryCounts = {};
    const urgentItems = [];

    const now = new Date();

    documents.forEach((doc) => {
      totalSizeBytes += doc.fileSize || 0;

      // Category count
      categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;

      if (doc.hasNoExpiry || !doc.expiryDate) {
        lifetime++;
      } else {
        const expiry = new Date(doc.expiryDate);
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          expired++;
          urgentItems.push({
            id: doc._id,
            title: doc.title,
            category: doc.category,
            expiryDate: doc.expiryDate,
            daysRemaining: diffDays,
            status: 'expired',
          });
        } else if (diffDays <= (doc.reminderDays || 30)) {
          expiringSoon++;
          if (diffDays <= 7) expiringIn7Days++;
          if (diffDays <= 30) expiringIn30Days++;
          if (diffDays <= 90) expiringIn90Days++;

          urgentItems.push({
            id: doc._id,
            title: doc.title,
            category: doc.category,
            expiryDate: doc.expiryDate,
            daysRemaining: diffDays,
            status: 'expiring_soon',
          });
        } else {
          valid++;
          if (diffDays <= 90) expiringIn90Days++;
        }
      }
    });

    // Sort urgent items: expired first, then smallest days remaining
    urgentItems.sort((a, b) => a.daysRemaining - b.daysRemaining);

    // Format category distribution
    const categoryDistribution = Object.keys(categoryCounts).map((cat) => ({
      category: cat,
      count: categoryCounts[cat],
      percentage: total > 0 ? Math.round((categoryCounts[cat] / total) * 100) : 0,
    }));

    // Monthly expiry timeline for next 6 months
    const monthlyTimeline = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthKey = `${monthName} ${year}`;

      const count = documents.filter((doc) => {
        if (!doc.expiryDate || doc.hasNoExpiry) return false;
        const exp = new Date(doc.expiryDate);
        return exp.getMonth() === d.getMonth() && exp.getFullYear() === d.getFullYear();
      }).length;

      monthlyTimeline.push({ month: monthKey, count });
    }

    res.json({
      success: true,
      stats: {
        total,
        valid,
        expiringSoon,
        expired,
        lifetime,
        expiringIn7Days,
        expiringIn30Days,
        expiringIn90Days,
        totalStorageMB: (totalSizeBytes / (1024 * 1024)).toFixed(2),
        categoryDistribution,
        urgentItems: urgentItems.slice(0, 8),
        monthlyTimeline,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
