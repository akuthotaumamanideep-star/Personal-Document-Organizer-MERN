import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Calendar, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function RenewModal({ isOpen, onClose, document, onRenewSuccess }) {
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [renewalNotes, setRenewalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (document) {
      // Default to 1 year from now
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      setNewExpiryDate(d.toISOString().substring(0, 10));
      setRenewalNotes('');
      setError('');
    }
  }, [document, isOpen]);

  if (!isOpen || !document) return null;

  const setPresetYears = (years) => {
    const base = document.expiryDate && new Date(document.expiryDate) > new Date()
      ? new Date(document.expiryDate)
      : new Date();
    base.setFullYear(base.getFullYear() + years);
    setNewExpiryDate(base.toISOString().substring(0, 10));
  };

  const setPresetMonths = (months) => {
    const base = document.expiryDate && new Date(document.expiryDate) > new Date()
      ? new Date(document.expiryDate)
      : new Date();
    base.setMonth(base.getMonth() + months);
    setNewExpiryDate(base.toISOString().substring(0, 10));
  };

  const handleRenew = async (e) => {
    e.preventDefault();
    if (!newExpiryDate) {
      setError('Please select a new expiry date');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.patch(`/documents/${document._id}/renew`, {
        newExpiryDate,
        notes: renewalNotes.trim(),
      });

      if (res.data.success) {
        onRenewSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to renew document');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-5 h-5 animate-spin-reverse" />
            <div>
              <h3 className="font-extrabold text-base">Quick Document Renewal</h3>
              <p className="text-xs text-amber-100">Extend expiration date easily</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleRenew} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-500">Document</p>
            <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{document.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Current Expiry:{' '}
              <span className="font-semibold text-rose-600">
                {document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : 'N/A'}
              </span>
            </p>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Quick Extension Presets
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPresetMonths(6)}
                className="py-1.5 px-2 text-xs font-bold rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700"
              >
                +6 Mos
              </button>
              <button
                type="button"
                onClick={() => setPresetYears(1)}
                className="py-1.5 px-2 text-xs font-bold rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700"
              >
                +1 Year
              </button>
              <button
                type="button"
                onClick={() => setPresetYears(2)}
                className="py-1.5 px-2 text-xs font-bold rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700"
              >
                +2 Years
              </button>
              <button
                type="button"
                onClick={() => setPresetYears(5)}
                className="py-1.5 px-2 text-xs font-bold rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700"
              >
                +5 Years
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              New Expiry Date *
            </label>
            <input
              type="date"
              required
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Renewal Note (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Paid renewal fee of $45 via card. Received confirmation."
              value={renewalNotes}
              onChange={(e) => setRenewalNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <span>Renewing...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Renewal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
