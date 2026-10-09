import React, { useState, useEffect } from 'react';
import {
  ClockAlert,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Infinity as InfinityIcon,
  RefreshCw,
  Eye,
  Calendar,
  Building,
  ArrowRight,
} from 'lucide-react';
import ExpiryBadge from '../components/ExpiryBadge';
import api from '../services/api';

export default function ExpiryTrackerPage({ onViewDoc, onRenewDoc }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('all');

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents?sort=expiry_asc');
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load documents for tracker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Categorize documents into urgency groups
  const expiredDocs = documents.filter((d) => d.status === 'expired');
  const critical7Days = documents.filter(
    (d) => d.status === 'expiring_soon' && d.daysRemaining <= 7 && d.daysRemaining >= 0
  );
  const warning30Days = documents.filter(
    (d) => d.status === 'expiring_soon' && d.daysRemaining > 7 && d.daysRemaining <= 30
  );
  const upcoming90Days = documents.filter((d) => {
    if (d.hasNoExpiry || !d.expiryDate) return false;
    return d.daysRemaining > 30 && d.daysRemaining <= 90;
  });
  const safeValidDocs = documents.filter((d) => {
    if (d.hasNoExpiry || !d.expiryDate) return false;
    return d.daysRemaining > 90;
  });
  const lifetimeDocs = documents.filter((d) => d.hasNoExpiry || !d.expiryDate);

  const groups = [
    {
      id: 'expired',
      title: 'Action Overdue: Already Expired',
      icon: AlertCircle,
      docs: expiredDocs,
      color: 'rose',
      border: 'border-rose-200',
      bg: 'bg-rose-50/40',
      badge: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'critical7',
      title: 'Urgent: Expiring within 7 Days',
      icon: AlertTriangle,
      docs: critical7Days,
      color: 'amber',
      border: 'border-amber-300',
      bg: 'bg-amber-50/50',
      badge: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'warning30',
      title: 'Attention: Expiring within 30 Days',
      icon: Clock,
      docs: warning30Days,
      color: 'orange',
      border: 'border-orange-200',
      bg: 'bg-orange-50/30',
      badge: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'upcoming90',
      title: 'Upcoming: Expiring within 90 Days',
      icon: Calendar,
      docs: upcoming90Days,
      color: 'blue',
      border: 'border-blue-200',
      bg: 'bg-blue-50/30',
      badge: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'safe',
      title: 'Healthy: Valid for > 90 Days',
      icon: CheckCircle2,
      docs: safeValidDocs,
      color: 'emerald',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/20',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'lifetime',
      title: 'Permanent: Lifetime Documents (No Expiry)',
      icon: InfinityIcon,
      docs: lifetimeDocs,
      color: 'purple',
      border: 'border-purple-200',
      bg: 'bg-purple-50/20',
      badge: 'bg-purple-100 text-purple-800',
    },
  ];

  const displayedGroups =
    selectedGroup === 'all'
      ? groups.filter((g) => g.docs.length > 0)
      : groups.filter((g) => g.id === selectedGroup && g.docs.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Expiry Date Intelligence & Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured timeline analyzing document lifecycles, critical expiration windows, and renewals.
          </p>
        </div>
        <button
          onClick={fetchDocs}
          className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 self-start sm:self-auto"
          title="Refresh timeline"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Urgency Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          onClick={() => setSelectedGroup('all')}
          className={`p-3 rounded-2xl border text-center transition-all ${
            selectedGroup === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider">All Records</p>
          <p className="text-xl font-black mt-0.5">{documents.length}</p>
        </button>

        <button
          onClick={() => setSelectedGroup('expired')}
          className={`p-3 rounded-2xl border text-center transition-all ${
            selectedGroup === 'expired'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white border-slate-200 text-rose-700 hover:bg-rose-50'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider">Expired</p>
          <p className="text-xl font-black mt-0.5">{expiredDocs.length}</p>
        </button>

        <button
          onClick={() => setSelectedGroup('critical7')}
          className={`p-3 rounded-2xl border text-center transition-all ${
            selectedGroup === 'critical7'
              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
              : 'bg-white border-slate-200 text-amber-700 hover:bg-amber-50'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider">Within 7d</p>
          <p className="text-xl font-black mt-0.5">{critical7Days.length}</p>
        </button>

        <button
          onClick={() => setSelectedGroup('warning30')}
          className={`p-3 rounded-2xl border text-center transition-all ${
            selectedGroup === 'warning30'
              ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
              : 'bg-white border-slate-200 text-orange-700 hover:bg-orange-50'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider">Within 30d</p>
          <p className="text-xl font-black mt-0.5">{warning30Days.length}</p>
        </button>

        <button
          onClick={() => setSelectedGroup('upcoming90')}
          className={`p-3 rounded-2xl border text-center transition-all ${
            selectedGroup === 'upcoming90'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white border-slate-200 text-blue-700 hover:bg-blue-50'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider">Within 90d</p>
          <p className="text-xl font-black mt-0.5">{upcoming90Days.length}</p>
        </button>

        <button
          onClick={() => setSelectedGroup('safe')}
          className={`p-3 rounded-2xl border text-center transition-all ${
            selectedGroup === 'safe'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white border-slate-200 text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider">Valid 90d+</p>
          <p className="text-xl font-black mt-0.5">{safeValidDocs.length}</p>
        </button>
      </div>

      {/* Timeline Section Groups */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Calculating expiry timeframes...</p>
        </div>
      ) : displayedGroups.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No documents in this category</h3>
          <p className="text-xs text-slate-500 mt-1">
            All records in this filter window are clear or have been updated.
          </p>
          <button
            onClick={() => setSelectedGroup('all')}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100"
          >
            Show All Timelines
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div
                key={group.id}
                className={`rounded-3xl border ${group.border} ${group.bg} p-5 space-y-4 shadow-sm`}
              >
                {/* Group Heading */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl ${
                        group.color === 'rose'
                          ? 'bg-rose-100 text-rose-700'
                          : group.color === 'amber'
                          ? 'bg-amber-100 text-amber-700'
                          : group.color === 'orange'
                          ? 'bg-orange-100 text-orange-700'
                          : group.color === 'blue'
                          ? 'bg-blue-100 text-blue-700'
                          : group.color === 'emerald'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      <GroupIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                        {group.title}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {group.docs.length} document{group.docs.length > 1 ? 's' : ''} in this bracket
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${group.badge}`}>
                    {group.docs.length}
                  </span>
                </div>

                {/* Document Cards in Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.docs.map((doc) => (
                    <div
                      key={doc._id}
                      className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {doc.category}
                          </span>
                          <ExpiryBadge
                            status={doc.status}
                            daysRemaining={doc.daysRemaining}
                            hasNoExpiry={doc.hasNoExpiry}
                          />
                        </div>

                        <div>
                          <h4
                            onClick={() => onViewDoc(doc)}
                            className="font-bold text-sm text-slate-900 hover:text-brand-600 cursor-pointer line-clamp-1"
                          >
                            {doc.title}
                          </h4>
                          {doc.documentNumber && (
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                              ID: {doc.documentNumber}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">Expires:</span>
                            <span className="font-semibold text-slate-800">
                              {doc.hasNoExpiry
                                ? 'No Expiry'
                                : doc.expiryDate
                                ? new Date(doc.expiryDate).toLocaleDateString()
                                : '—'}
                            </span>
                          </div>
                          {doc.issuingAuthority && (
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-400">Authority:</span>
                              <span className="font-medium text-slate-700 truncate max-w-[140px]">
                                {doc.issuingAuthority}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onViewDoc(doc)}
                          className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                        {!doc.hasNoExpiry && (
                          <button
                            onClick={() => onRenewDoc(doc)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all inline-flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Renew Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
