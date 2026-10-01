'use client';

import React from 'react';
import { useAdmin } from '@/lib/admin-context';

export default function LiveMachineStrip() {
  const { machines, navigateToMachine, lastSyncSecs } = useAdmin();

  const syncText =
    lastSyncSecs === 0
      ? 'just now'
      : lastSyncSecs < 60
      ? `${lastSyncSecs}s ago`
      : `${Math.floor(lastSyncSecs / 60)}m ago`;

  return (
    <div className="card p-3 sm:p-3.5 flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* Live Badge */}
      <div className="flex items-center gap-2 pr-4 sm:pr-6 border-r border-line shrink-0">
        <span className="pulse-dot w-2 h-2 rounded-full bg-leaf-500 inline-block" />
        <span className="text-[13px] font-semibold text-ink-900">Live</span>
      </div>

      {/* Machine Chips */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 flex-1 min-w-0">
        {machines.map((m) => (
          <button
            key={m.id}
            onClick={() => navigateToMachine(m.id, 'overview')}
            className="flex items-center gap-2.5 text-left hover:bg-page p-1.5 rounded-lg transition group cursor-pointer"
          >
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[15px] shrink-0 ${
                m.mode === 'HOT'
                  ? 'bg-brand-50 text-brand-600'
                  : 'bg-amber2-50 text-amber2-600'
              }`}
            >
              {m.mode === 'HOT' ? '🏪' : '🧊'}
            </span>
            <div className="leading-tight min-w-0">
              <p className="text-[12.5px] font-semibold text-ink-900 group-hover:text-brand-500 transition truncate">
                {m.code} · {m.name}
              </p>
              <p className="text-[11px] text-ink-500 font-mono">
                {m.temp.toFixed(1)}°C · {m.milkLiters}L · {m.cupsCount} cups
              </p>
            </div>
            <span
              className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                m.status === 'ONLINE'
                  ? 'bg-leaf-50 text-leaf-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {m.status}
            </span>
          </button>
        ))}
      </div>

      {/* Last Sync */}
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <span className="text-[11.5px] text-ink-500">Last sync</span>
        <span className="text-[11.5px] font-semibold font-mono text-ink-900">
          {syncText}
        </span>
      </div>
    </div>
  );
}
