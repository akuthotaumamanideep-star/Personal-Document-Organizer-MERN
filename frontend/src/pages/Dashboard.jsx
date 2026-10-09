import React, { useState, useEffect } from 'react';
import {
  Files,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Infinity as InfinityIcon,
  HardDrive,
  Plus,
  RefreshCw,
  ExternalLink,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ExpiryBadge from '../components/ExpiryBadge';
import api from '../services/api';

export default function Dashboard({
  onOpenAddModal,
  onNavigate,
  onViewDoc,
  onRenewDoc,
}) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentDocs, setRecentDocs] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, docsRes] = await Promise.all([
        api.get('/stats/dashboard'),
        api.get('/documents?sort=newest'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (docsRes.data.success) {
        setRecentDocs(docsRes.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading document vault intelligence...</p>
      </div>
    );
  }

  const urgentItems = stats?.urgentItems || [];

  return (
    <div className="space-y-6">
      {/* Welcome / Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Document Overview & Expiry Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of personal identity records, certificates, and expiration dates.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Document</span>
          </button>
        </div>
      </div>

      {/* Urgent Expiry Alert Banner (if any expired or expiring soon) */}
      {urgentItems.length > 0 && (
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">
                  Action Required: {urgentItems.length} Document(s) Expired or Expiring Soon
                </h3>
                <p className="text-xs text-white/90 mt-0.5 max-w-2xl">
                  {urgentItems[0]?.title} requires your attention ({urgentItems[0]?.status === 'expired'
                    ? `expired ${Math.abs(urgentItems[0]?.daysRemaining)} days ago`
                    : `expires in ${urgentItems[0]?.daysRemaining} days`}). Renew to avoid penalties or disruption.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('expiry-tracker')}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-white text-slate-900 hover:bg-white/90 shadow-sm transition-all"
              >
                Review Expiry Tracker →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Documents"
          value={stats?.total || 0}
          subtitle="Managed in vault"
          icon={Files}
          color="blue"
          onClick={() => onNavigate('documents')}
        />
        <StatCard
          title="Valid & Active"
          value={stats?.valid || 0}
          subtitle="No renewal needed"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => onNavigate('documents')}
        />
        <StatCard
          title="Expiring Soon"
          value={stats?.expiringSoon || 0}
          subtitle="Within 30 days"
          icon={AlertTriangle}
          color="amber"
          onClick={() => onNavigate('expiry-tracker')}
        />
        <StatCard
          title="Expired"
          value={stats?.expired || 0}
          subtitle="Renewal overdue"
          icon={AlertCircle}
          color="rose"
          onClick={() => onNavigate('expiry-tracker')}
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <InfinityIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Lifetime Documents</p>
              <p className="text-[11px] text-slate-400">Degrees, birth certificates, deeds</p>
            </div>
          </div>
          <span className="text-lg font-extrabold text-slate-900">{stats?.lifetime || 0}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Vault File Storage</p>
              <p className="text-[11px] text-slate-400">PDFs, images & scans</p>
            </div>
          </div>
          <span className="text-lg font-extrabold text-slate-900">
            {stats?.totalStorageMB || '0.00'} MB
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Expiring in 7 Days</p>
              <p className="text-[11px] text-slate-400">Highest urgency alert</p>
            </div>
          </div>
          <span className="text-lg font-extrabold text-amber-600">
            {stats?.expiringIn7Days || 0}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Category Distribution & Monthly Expiry Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-sm text-slate-900">Documents by Category</h3>
            </div>
            <button
              onClick={() => onNavigate('categories')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
            >
              Manage Categories →
            </button>
          </div>

          <div className="space-y-3">
            {stats?.categoryDistribution && stats.categoryDistribution.length > 0 ? (
              stats.categoryDistribution.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat.category}</span>
                    <span className="font-bold text-slate-900">
                      {cat.count} doc{cat.count > 1 ? 's' : ''} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, cat.percentage))}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                No categories populated yet.
              </p>
            )}
          </div>
        </div>

        {/* Upcoming 6 Months Expiry Timeline */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-sm text-slate-900">Upcoming Expiry Forecast (6 Mos)</h3>
            </div>
            <button
              onClick={() => onNavigate('expiry-tracker')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
            >
              Full Timeline →
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {stats?.monthlyTimeline?.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center transition-all ${
                  item.count > 0
                    ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-100 text-slate-500'
                }`}
              >
                <p className="text-[10px] uppercase font-bold tracking-wider">{item.month}</p>
                <p className="text-xl font-extrabold mt-1">
                  {item.count}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  {item.count === 1 ? 'expiry' : 'expiries'}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Tip Box */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
            <div className="p-1 rounded bg-brand-100 text-brand-700 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Tip:</strong> You can set custom reminder alert windows (7, 15, 30, 60, or 90 days) per document when adding or editing records.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recently Added / Updated Records</h3>
            <p className="text-xs text-slate-500">Quick access to latest document entries</p>
          </div>
          <button
            onClick={() => onNavigate('documents')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
          >
            <span>View All Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase font-bold text-slate-400">
                <th className="py-2.5 px-3">Document Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Expiry Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentDocs.length > 0 ? (
                recentDocs.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[200px]">{doc.title}</span>
                        {doc.documentNumber && (
                          <span className="text-[10px] font-mono text-slate-400">
                            #{doc.documentNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{doc.category}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {doc.hasNoExpiry
                        ? 'Lifetime'
                        : doc.expiryDate
                        ? new Date(doc.expiryDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <ExpiryBadge
                        status={doc.status}
                        daysRemaining={doc.daysRemaining}
                        hasNoExpiry={doc.hasNoExpiry}
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewDoc(doc)}
                          className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors text-xs font-semibold"
                        >
                          View
                        </button>
                        {!doc.hasNoExpiry && (
                          <button
                            onClick={() => onRenewDoc(doc)}
                            className="px-2.5 py-1 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors text-xs font-semibold"
                          >
                            Renew
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No documents found. Click "Add New Document" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
