const Category = require('../models/Category');

// Default starter categories
const DEFAULT_CATEGORIES = [
  { name: 'Identification', icon: 'CreditCard', color: '#3B82F6', description: 'Passports, National IDs, Driving Licenses', isDefault: true },
  { name: 'Financial & Tax', icon: 'DollarSign', color: '#10B981', description: 'Tax returns, Bank statements, Investment bonds', isDefault: true },
  { name: 'Insurance & Healthcare', icon: 'ShieldCheck', color: '#EF4444', description: 'Health insurance, Life coverage, Medical prescriptions', isDefault: true },
  { name: 'Education & Certificates', icon: 'GraduationCap', color: '#8B5CF6', description: 'Degrees, Diplomas, Transcripts, Certifications', isDefault: true },
  { name: 'Legal & Contracts', icon: 'Scale', color: '#F59E0B', description: 'Agreements, Wills, Property deeds, Leases', isDefault: true },
  { name: 'Vehicles & Transport', icon: 'Car', color: '#EC4899', description: 'Vehicle RC, Emission certificates, Road taxes', isDefault: true },
  { name: 'Employment & Career', icon: 'Briefcase', color: '#06B6D4', description: 'Offer letters, Payslips, Experience letters', isDefault: true },
  { name: 'Warranty & Invoices', icon: 'Receipt', color: '#14B8A6', description: 'Product receipts, Device warranties, Guarantees', isDefault: true },
  { name: 'Travel & Visas', icon: 'Plane', color: '#6366F1', description: 'Visas, Travel permits, Boarding passes', isDefault: true },
  { name: 'General', icon: 'Folder', color: '#6B7280', description: 'Miscellaneous personal records and files', isDefault: true },
];

// @desc    Get all categories for user (default + custom)
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [{ isDefault: true }, { createdBy: req.user.id }],
    }).sort({ isDefault: -1, name: 1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create custom category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await Category.create({
      name,
      description: description || '',
      color: color || '#3B82F6',
      icon: icon || 'Folder',
      isDefault: false,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete custom category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (category.isDefault) {
      return res.status(400).json({ success: false, message: 'Cannot delete default system category' });
    }

    if (category.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await category.deleteOne();

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
