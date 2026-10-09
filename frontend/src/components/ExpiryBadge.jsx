import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Infinity as InfinityIcon } from 'lucide-react';

export default function ExpiryBadge({ status, daysRemaining, hasNoExpiry, showDays = true }) {
  if (hasNoExpiry || status === 'lifetime') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
        <InfinityIcon className="w-3.5 h-3.5" />
        Lifetime
      </span>
    );
  }

  if (status === 'expired') {
    const daysAgo = daysRemaining ? Math.abs(daysRemaining) : 0;
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3.5 h-3.5" />
        Expired {showDays && daysAgo > 0 ? `(${daysAgo}d ago)` : ''}
      </span>
    );
  }

  if (status === 'expiring_soon') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        Expiring Soon {showDays && daysRemaining !== null ? `(${daysRemaining}d left)` : ''}
      </span>
    );
  }

  // Valid
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5" />
      Valid {showDays && daysRemaining !== null ? `(${daysRemaining}d left)` : ''}
    </span>
  );
}
