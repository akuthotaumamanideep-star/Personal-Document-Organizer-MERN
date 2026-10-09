import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', onClick }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100 text-blue-600',
      border: 'border-blue-100',
      text: 'text-blue-900',
    },
    emerald: {
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100 text-emerald-600',
      border: 'border-emerald-100',
      text: 'text-emerald-900',
    },
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100 text-amber-600',
      border: 'border-amber-200',
      text: 'text-amber-900',
    },
    rose: {
      bg: 'bg-rose-50',
      iconBg: 'bg-rose-100 text-rose-600',
      border: 'border-rose-200',
      text: 'text-rose-900',
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100 text-purple-600',
      border: 'border-purple-100',
      text: 'text-purple-900',
    },
    indigo: {
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-100 text-indigo-600',
      border: 'border-indigo-100',
      text: 'text-indigo-900',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white border ${scheme.border} shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-xl ${scheme.iconBg}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
}
