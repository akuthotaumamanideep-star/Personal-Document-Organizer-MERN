import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DocumentsPage from './pages/DocumentsPage';
import ExpiryTrackerPage from './pages/ExpiryTrackerPage';
import CategoriesPage from './pages/CategoriesPage';
import ProjectOverviewPage from './pages/ProjectOverviewPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import DocumentModal from './components/DocumentModal';
import DocumentViewModal from './components/DocumentViewModal';
import RenewModal from './components/RenewModal';
import api from './services/api';

function MainApp() {
  const { isAuthenticated, loading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Global Categories State
  const [categories, setCategories] = useState([]);

  // Urgent Documents Alert State (for Navbar bell)
  const [urgentDocs, setUrgentDocs] = useState([]);

  // Modal States
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  const [viewingDoc, setViewingDoc] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [renewingDoc, setRenewingDoc] = useState(null);
  const [isRenewOpen, setIsRenewOpen] = useState(false);

  // Success Toast notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories in App:', err);
    }
  };

  const loadUrgentAlerts = async () => {
    try {
      const res = await api.get('/stats/dashboard');
      if (res.data.success) {
        setUrgentDocs(res.data.stats.urgentItems || []);
      }
    } catch (err) {
      console.error('Failed to load urgent alerts:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
      loadUrgentAlerts();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading DocVault Vault...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Handlers for Document actions
  const handleOpenAddModal = () => {
    setEditingDoc(null);
    setIsAddEditOpen(true);
  };

  const handleEditDoc = (doc) => {
    setEditingDoc(doc);
    setIsAddEditOpen(true);
  };

  const handleViewDoc = (doc) => {
    setViewingDoc(doc);
    setIsViewOpen(true);
  };

  const handleRenewDoc = (doc) => {
    setRenewingDoc(doc);
    setIsRenewOpen(true);
  };

  const handleDocSaved = (savedDoc) => {
    showToast(editingDoc ? 'Document record updated successfully' : 'Document added to vault successfully');
    loadUrgentAlerts();
  };

  const handleDocRenewed = (renewedDoc) => {
    showToast(`Document renewed! New expiry: ${new Date(renewedDoc.expiryDate).toLocaleDateString()}`);
    loadUrgentAlerts();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onNavigate={setActiveTab}
        activeTab={activeTab}
        urgentDocs={urgentDocs}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          urgentCount={urgentDocs.length}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              onOpenAddModal={handleOpenAddModal}
              onNavigate={setActiveTab}
              onViewDoc={handleViewDoc}
              onRenewDoc={handleRenewDoc}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsPage
              onOpenAddModal={handleOpenAddModal}
              onViewDoc={handleViewDoc}
              onEditDoc={handleEditDoc}
              onRenewDoc={handleRenewDoc}
              categories={categories}
            />
          )}

          {activeTab === 'expiry-tracker' && (
            <ExpiryTrackerPage
              onViewDoc={handleViewDoc}
              onRenewDoc={handleRenewDoc}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesPage onRefreshCategories={loadCategories} />
          )}

          {activeTab === 'project-info' && <ProjectOverviewPage />}

          {activeTab === 'admin' && <AdminPage />}
        </main>
      </div>

      {/* Global Modals */}
      <DocumentModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleDocSaved}
        editingDoc={editingDoc}
        categories={categories}
      />

      <DocumentViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        document={viewingDoc}
        onEdit={handleEditDoc}
        onRenew={handleRenewDoc}
      />

      <RenewModal
        isOpen={isRenewOpen}
        onClose={() => setIsRenewOpen(false)}
        document={renewingDoc}
        onRenewSuccess={handleDocRenewed}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
