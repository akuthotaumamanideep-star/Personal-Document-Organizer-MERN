import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Bell,
  Plus,
  LogOut,
  User as UserIcon,
  Search,
  BookOpen,
  AlertTriangle,
  X,
} from 'lucide-react';

export default function Navbar({ onOpenAddModal, onNavigate, activeTab, urgentDocs = [] }) {
  const { user, logout, isAdmin } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const urgentCount = urgentDocs.length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
              DocVault
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200">
                MERN
              </span>
            </span>
            <p className="text-[11px] text-slate-400 font-medium -mt-0.5 hidden sm:block">
              Personal Document & Expiry Organizer
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Project Overview quick link */}
          <button
            onClick={() => onNavigate('project-info')}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'project-info'
                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-600" />
            Project Architecture
          </button>

          {/* Add Document button */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Document</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {urgentCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {urgentCount}
                </span>
              )}
            </button>

            {/* Notification Popup */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-sm text-slate-900">Expiry Alerts ({urgentCount})</h4>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto mt-2 space-y-2">
                  {urgentDocs.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">
                      All documents are up-to-date! No immediate expiries.
                    </p>
                  ) : (
                    urgentDocs.map((doc) => (
                      <div
                        key={doc.id || doc._id}
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigate('expiry-tracker');
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                          doc.status === 'expired'
                            ? 'border-rose-200 bg-rose-50/50'
                            : 'border-amber-200 bg-amber-50/40'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-slate-900 truncate max-w-[200px]">{doc.title}</span>
                          <span
                            className={
                              doc.status === 'expired'
                                ? 'text-rose-600 font-bold'
                                : 'text-amber-600 font-bold'
                            }
                          >
                            {doc.status === 'expired'
                              ? `Expired (${Math.abs(doc.daysRemaining)}d)`
                              : `${doc.daysRemaining}d left`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{doc.category}</p>
                      </div>
                    ))
                  )}
                </div>

                {urgentDocs.length > 0 && (
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('expiry-tracker');
                    }}
                    className="w-full mt-3 py-1.5 text-center text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
                  >
                    View All in Expiry Tracker →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center pl-2 border-l border-slate-200 gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center font-bold text-xs uppercase">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {user?.name}
                </p>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      isAdmin
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isAdmin ? 'ADMIN' : 'USER'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
