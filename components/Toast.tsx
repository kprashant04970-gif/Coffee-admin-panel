'use client';

import React from 'react';
import { useAdmin } from '@/lib/admin-context';

export default function Toast() {
  const { toasts, dismissToast } = useAdmin();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={`pointer-events-auto cursor-pointer px-4 py-2.5 rounded-xl shadow-pop text-[13px] font-medium flex items-center justify-between transition transform duration-200 animate-in fade-in slide-in-from-bottom-2 ${
            t.type === 'error'
              ? 'bg-rose-900 text-white border border-rose-700'
              : t.type === 'warn'
              ? 'bg-amber-900 text-amber-50 border border-amber-700'
              : t.type === 'success'
              ? 'bg-emerald-900 text-white border border-emerald-700'
              : 'bg-ink-900 text-white border border-ink-700'
          }`}
        >
          <span>{t.message}</span>
          <span className="text-xs opacity-60 ml-3">✕</span>
        </div>
      ))}
    </div>
  );
}
