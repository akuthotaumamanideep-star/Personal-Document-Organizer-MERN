import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Calendar, Tag, AlertCircle, Check } from 'lucide-react';
import api from '../services/api';

export default function DocumentModal({ isOpen, onClose, onSave, editingDoc = null, categories = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    documentNumber: '',
    category: 'General',
    issueDate: '',
    expiryDate: '',
    hasNoExpiry: false,
    issuingAuthority: '',
    notes: '',
    tags: '',
    reminderDays: 30,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editingDoc changes
  useEffect(() => {
    if (editingDoc) {
      setFormData({
        title: editingDoc.title || '',
        documentNumber: editingDoc.documentNumber || '',
        category: editingDoc.category || (categories[0]?.name || 'General'),
        issueDate: editingDoc.issueDate ? editingDoc.issueDate.substring(0, 10) : '',
        expiryDate: editingDoc.expiryDate ? editingDoc.expiryDate.substring(0, 10) : '',
        hasNoExpiry: editingDoc.hasNoExpiry || false,
        issuingAuthority: editingDoc.issuingAuthority || '',
        notes: editingDoc.notes || '',
        tags: Array.isArray(editingDoc.tags) ? editingDoc.tags.join(', ') : '',
        reminderDays: editingDoc.reminderDays || 30,
      });
      setSelectedFile(null);
    } else {
      setFormData({
        title: '',
        documentNumber: '',
        category: categories[0]?.name || 'General',
        issueDate: '',
        expiryDate: '',
        hasNoExpiry: false,
        issuingAuthority: '',
        notes: '',
        tags: '',
        reminderDays: 30,
      });
      setSelectedFile(null);
    }
    setError('');
  }, [editingDoc, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Document title is required');
      return;
    }

    if (!formData.hasNoExpiry && !formData.expiryDate) {
      setError('Please provide an expiry date, or check "Lifetime / No Expiry"');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('documentNumber', formData.documentNumber.trim());
      data.append('category', formData.category);
      data.append('issueDate', formData.issueDate);
      data.append('hasNoExpiry', formData.hasNoExpiry);
      data.append('expiryDate', formData.hasNoExpiry ? '' : formData.expiryDate);
      data.append('issuingAuthority', formData.issuingAuthority.trim());
      data.append('notes', formData.notes.trim());
      data.append('tags', formData.tags);
      data.append('reminderDays', formData.reminderDays);

      if (selectedFile) {
        data.append('file', selectedFile);
      }

      let res;
      if (editingDoc) {
        res = await api.put(`/documents/${editingDoc._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/documents', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        onSave(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error('Save doc error:', err);
      setError(err.response?.data?.message || 'Failed to save document. Please check fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-fade-in">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-indigo-50/40 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingDoc ? 'Edit Document' : 'Add New Document'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in document details, dates, and attach relevant files.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Passport, Health Insurance Policy, Degree Certificate"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Document Number / ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Document Number / ID
              </label>
              <input
                type="text"
                placeholder="e.g. Z9182736, DL-042022009182"
                value={formData.documentNumber}
                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
              >
                {categories.map((c) => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Expiry Date Section */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Expiry Date
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-brand-600 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={formData.hasNoExpiry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hasNoExpiry: e.target.checked,
                        expiryDate: e.target.checked ? '' : formData.expiryDate,
                      })
                    }
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Lifetime / No Expiry</span>
                </label>
              </div>
              <input
                type="date"
                disabled={formData.hasNoExpiry}
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                  formData.hasNoExpiry ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
                }`}
              />
            </div>

            {/* Reminder Alert Window */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Notify Before Expiry
              </label>
              <select
                disabled={formData.hasNoExpiry}
                value={formData.reminderDays}
                onChange={(e) => setFormData({ ...formData, reminderDays: Number(e.target.value) })}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white ${
                  formData.hasNoExpiry ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
                }`}
              >
                <option value={7}>7 Days Before</option>
                <option value={15}>15 Days Before</option>
                <option value={30}>30 Days Before (Standard)</option>
                <option value={60}>60 Days Before</option>
                <option value={90}>90 Days Before</option>
              </select>
            </div>

            {/* Issuing Authority */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Issuing Authority / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Government, University, Bank, RTO"
                value={formData.issuingAuthority}
                onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. travel, urgent, id, renewal"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Notes & Instructions
              </label>
              <textarea
                rows={2}
                placeholder="Add any reminders, renewal steps, or notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* File Attachment Upload */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                File Attachment (PDF, Image, DOC)
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-2xl p-4 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="fileUpload"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.txt"
                />
                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-600 hover:underline">
                      Click to upload
                    </span>{' '}
                    <span className="text-xs text-slate-500">or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-slate-400">PDF, PNG, JPG, DOC up to 25MB</p>
                </label>

                {/* Selected or Existing file indicator */}
                {selectedFile ? (
                  <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate font-semibold">{selectedFile.name}</span>
                      <span className="text-[10px] text-emerald-600">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-emerald-700 hover:text-emerald-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : editingDoc?.fileName ? (
                  <div className="mt-3 p-2 bg-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="truncate font-medium">
                        Current: {editingDoc.fileOriginalName || editingDoc.fileName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Upload to replace</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editingDoc ? 'Update Document' : 'Save Document'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
