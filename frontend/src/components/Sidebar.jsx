import React from 'react';
import {
  LayoutDashboard,
  Files,
  ClockAlert,
  Layers,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, onNavigate, urgentCount = 0 }) {
  const { isAdmin } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'documents',
      label: 'Document Library',
      icon: Files,
    },
    {
      id: 'expiry-tracker',
      label: 'Expiry Tracker',
      icon: ClockAlert,
      badge: urgentCount > 0 ? urgentCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Layers,
    },
    {
      id: 'project-info',
      label: 'Project Overview',
      icon: BookOpen,
      special: true,
    },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Admin Control',
      icon: ShieldCheck,
      adminOnly: true,
    });
  }

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 md:min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-brand-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
              {item.adminOnly && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  ADMIN
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-left">
          <p className="text-[11px] font-bold text-slate-700">MERN Stack Document Hub</p>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
            Full CRUD • Expiry Alarms • JWT Auth • Role-based access
          </p>
        </div>
      </div>
    </aside>
  );
}
