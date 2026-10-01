'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '@/lib/admin-context';
import {
  Sun,
  Moon,
  Laptop,
  Eye,
  Sliders,
  Check,
  Sparkles,
  Rows3,
  Contrast,
} from 'lucide-react';

export default function ThemeDisplayPopover() {
  const {
    themeMode,
    setThemeMode,
    resolvedTheme,
    highContrast,
    setHighContrast,
    compactDensity,
    setCompactDensity,
    toast,
  } = useAdmin();

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button in Topbar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line bg-page hover:bg-white text-[12px] font-medium text-ink-700 transition cursor-pointer shadow-2xs"
        title="Display, Theme & Density Controls"
        aria-label="Display, Theme & Density Controls"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
        <span className="hidden md:inline font-semibold capitalize text-xs">
          {themeMode === 'auto' ? 'Auto Theme' : themeMode === 'dark' ? 'Dark' : 'Light'}
        </span>
        {highContrast && (
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" title="High Contrast Active" />
        )}
        {compactDensity && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Compact Density Active" />
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-line rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 text-ink-900">
          {/* Header */}
          <div className="pb-3 mb-3 border-b border-line flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-ink-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-brand-600" />
                <span>Display &amp; Appearance</span>
              </h3>
              <p className="text-[11px] text-ink-500 mt-0.5">
                Optimized for long operational shifts &amp; field conditions
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-ink-100 text-ink-700 font-semibold uppercase">
              {resolvedTheme} mode
            </span>
          </div>

          {/* 1. Theme Mode Switcher (Light / Dark / Auto) */}
          <div className="space-y-1.5 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
              Color Theme
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-ink-50 rounded-xl border border-line">
              {/* Light Theme Button */}
              <button
                onClick={() => {
                  setThemeMode('light');
                  toast('Switched to Light mode', 'info');
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-white text-ink-900 shadow-sm border border-line'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                <Sun className={`w-4 h-4 mb-1 ${themeMode === 'light' ? 'text-amber-500' : ''}`} />
                <span>Light</span>
              </button>

              {/* Dark Theme Button */}
              <button
                onClick={() => {
                  setThemeMode('dark');
                  toast('Switched to Dark mode (OLED slate)', 'info');
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-ink-900 text-white shadow-sm border border-ink-800'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                <Moon className={`w-4 h-4 mb-1 ${themeMode === 'dark' ? 'text-amber-400' : ''}`} />
                <span>Dark</span>
              </button>

              {/* Auto / System Theme Button */}
              <button
                onClick={() => {
                  setThemeMode('auto');
                  toast('Auto theme enabled: Syncs with system preferences', 'info');
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  themeMode === 'auto'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                <Laptop className="w-4 h-4 mb-1" />
                <span>Auto</span>
              </button>
            </div>
          </div>

          {/* 2. High Contrast Mode Toggle */}
          <div className="py-2.5 border-t border-line flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Contrast className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-ink-900 leading-tight">
                  High Contrast Mode
                </p>
                <p className="text-[11px] text-ink-500 leading-snug mt-0.5">
                  Elevates borders &amp; text contrast for sunlight &amp; warehouse glare.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => {
                  setHighContrast(e.target.checked);
                  toast(
                    e.target.checked
                      ? 'High Contrast mode enabled'
                      : 'High Contrast mode disabled',
                    'info'
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-ink-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500" />
            </label>
          </div>

          {/* 3. Compact Density Mode Toggle */}
          <div className="pt-2.5 border-t border-line flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Rows3 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-ink-900 leading-tight">
                  Compact Density Mode
                </p>
                <p className="text-[11px] text-ink-500 leading-snug mt-0.5">
                  Tighter paddings &amp; rows for high-density IoT telemetry surveillance.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={compactDensity}
                onChange={(e) => {
                  setCompactDensity(e.target.checked);
                  toast(
                    e.target.checked
                      ? 'Compact Density mode enabled'
                      : 'Compact Density mode disabled',
                    'info'
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-ink-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
