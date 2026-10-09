import React from 'react';
import {
  X,
  Calendar,
  Building,
  Download,
  ExternalLink,
  Edit2,
  RefreshCw,
  FileText,
  Clock,
  Tag,
  Hash,
} from 'lucide-react';
import ExpiryBadge from './ExpiryBadge';

export default function DocumentViewModal({
  isOpen,
  onClose,
  document,
  onEdit,
  onRenew,
}) {
  if (!isOpen || !document) return null;

  const isImage = document.fileName?.match(/\.(jpg|jpeg|png|webp|gif)$/i);
  const isPdf = document.fileName?.match(/\.pdf$/i);
  const fileUrl = document.fileName ? `/api/documents/preview/${document.fileName}` : null;
  const downloadUrl = document.fileName ? `/api/documents/download/${document.fileName}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-fade-in">
        {/* Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                {document.category}
              </span>
              <ExpiryBadge
                status={document.status}
                daysRemaining={document.daysRemaining}
                hasNoExpiry={document.hasNoExpiry}
              />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white mt-1">
              {document.title}
            </h2>
            {document.documentNumber && (
              <p className="text-xs text-indigo-200 flex items-center gap-1 font-mono">
                <Hash className="w-3.5 h-3.5" /> ID: {document.documentNumber}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6">
          {/* Key Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400">Issue Date</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {document.issueDate
                  ? new Date(document.issueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400">Expiry Date</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                {document.hasNoExpiry
                  ? 'Lifetime / No Expiry'
                  : document.expiryDate
                  ? new Date(document.expiryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400">Issuing Authority</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5 truncate">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{document.issuingAuthority || 'Not specified'}</span>
              </p>
            </div>
          </div>

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {document.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                  >
                    <Tag className="w-3 h-3 text-slate-400" /> #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {document.notes && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Notes & Instructions
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {document.notes}
              </div>
            </div>
          )}

          {/* Attached Document File Preview */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Attached Document
            </p>
            {document.fileName ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {document.fileOriginalName || document.fileName}
                    </span>
                    {document.fileSize > 0 && (
                      <span className="text-[11px] text-slate-400">
                        ({(document.fileSize / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open
                    </a>
                    <a
                      href={downloadUrl}
                      download
                      className="px-3 py-1 rounded-lg text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>

                {/* Inline Preview */}
                <div className="p-4 flex items-center justify-center max-h-80 overflow-y-auto">
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt={document.title}
                      className="max-h-72 object-contain rounded-xl shadow-sm border border-slate-200"
                    />
                  ) : isPdf ? (
                    <iframe
                      src={fileUrl}
                      title="PDF Preview"
                      className="w-full h-72 rounded-xl border border-slate-200 bg-white"
                    />
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">
                        File format preview previewable in new tab or downloadable.
                      </p>
                      <a
                        href={downloadUrl}
                        download
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" /> Click here to download file
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No file attached to this document.</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onRenew(document);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Quick Renew Expiry
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(document);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Details
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
