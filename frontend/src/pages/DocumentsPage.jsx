import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  Calendar,
  Building,
  FileText,
  Tag,
  Hash,
} from 'lucide-react';
import ExpiryBadge from '../components/ExpiryBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

export default function DocumentsPage({
  onOpenAddModal,
  onViewDoc,
  onEditDoc,
  onRenewDoc,
  categories = [],
}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('expiry_asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (sortBy) params.append('sort', sortBy);

      const res = await api.get(`/documents?${params.toString()}`);
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [search, categoryFilter, statusFilter, sortBy]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/documents/${deleteTarget._id}`);
      if (res.data.success) {
        setDocuments(documents.filter((d) => d._id !== deleteTarget._id));
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error('Delete document failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Document Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, categorize, search, and monitor expiry dates for all stored files.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Document</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, document ID, issuing authority, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium text-slate-700"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="w-full md:w-52">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium text-slate-700"
            >
              <option value="expiry_asc">Expiry Date (Nearest First)</option>
              <option value="expiry_desc">Expiry Date (Furthest First)</option>
              <option value="newest">Recently Added</option>
              <option value="oldest">Oldest Added</option>
              <option value="title_asc">Title (A - Z)</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50 self-start md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-brand-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white shadow-sm text-brand-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider shrink-0 mr-1">
            Status:
          </span>
          {[
            { id: 'all', label: 'All Records' },
            { id: 'valid', label: 'Active & Valid' },
            { id: 'expiring_soon', label: 'Expiring Soon' },
            { id: 'expired', label: 'Expired' },
            { id: 'lifetime', label: 'Lifetime' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-xs font-bold text-slate-500 shrink-0">
            {documents.length} document{documents.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Content Rendering: Grid vs Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Searching records...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No documents found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, status filters, or click below to upload a new document record.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Document
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-brand-200"
            >
              <div className="p-5 space-y-3.5">
                {/* Header row: category and expiry badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 truncate max-w-[140px]">
                    {doc.category}
                  </span>
                  <ExpiryBadge
                    status={doc.status}
                    daysRemaining={doc.daysRemaining}
                    hasNoExpiry={doc.hasNoExpiry}
                  />
                </div>

                {/* Title and ID */}
                <div>
                  <h3
                    onClick={() => onViewDoc(doc)}
                    className="font-bold text-slate-900 text-sm hover:text-brand-600 cursor-pointer line-clamp-1 transition-colors"
                  >
                    {doc.title}
                  </h3>
                  {doc.documentNumber && (
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                      <Hash className="w-3 h-3" /> {doc.documentNumber}
                    </p>
                  )}
                </div>

                {/* Authority & Expiry date details */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Expiry Date:</span>
                    <span className="font-semibold text-slate-800">
                      {doc.hasNoExpiry
                        ? 'Lifetime Valid'
                        : doc.expiryDate
                        ? new Date(doc.expiryDate).toLocaleDateString()
                        : 'Not specified'}
                    </span>
                  </div>

                  {doc.issuingAuthority && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Authority:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[150px]">
                        {doc.issuingAuthority}
                      </span>
                    </div>
                  )}

                  {doc.fileName && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">File Attachment:</span>
                      <span className="font-semibold text-brand-600 flex items-center gap-1 text-[11px] truncate max-w-[140px]">
                        <FileText className="w-3 h-3" />
                        {doc.fileOriginalName || 'Attached'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags preview */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {doc.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{doc.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onViewDoc(doc)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-white transition-colors"
                    title="View details & preview file"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditDoc(doc)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-white transition-colors"
                    title="Edit document"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {doc.fileName && (
                    <a
                      href={`/api/documents/download/${doc.fileName}`}
                      download
                      className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-white transition-colors"
                      title="Download attached file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {!doc.hasNoExpiry && (
                    <button
                      onClick={() => onRenewDoc(doc)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Renew
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(doc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Document ID</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Attachment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span
                        onClick={() => onViewDoc(doc)}
                        className="hover:text-brand-600 cursor-pointer"
                      >
                        {doc.title}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{doc.category}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {doc.documentNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {doc.hasNoExpiry
                        ? 'Lifetime'
                        : doc.expiryDate
                        ? new Date(doc.expiryDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <ExpiryBadge
                        status={doc.status}
                        daysRemaining={doc.daysRemaining}
                        hasNoExpiry={doc.hasNoExpiry}
                      />
                    </td>
                    <td className="py-3 px-4">
                      {doc.fileName ? (
                        <a
                          href={`/api/documents/preview/${doc.fileName}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" /> Preview
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewDoc(doc)}
                          className="p-1 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditDoc(doc)}
                          className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!doc.hasNoExpiry && (
                          <button
                            onClick={() => onRenewDoc(doc)}
                            className="p-1 rounded-lg text-amber-600 hover:bg-amber-50"
                            title="Renew"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(doc)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Document Record"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will permanently remove the record and any associated files.`}
        confirmText="Yes, Delete"
        confirmColor="rose"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
