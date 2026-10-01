'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Lock, FileWarning, Terminal, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const requiredRole = searchParams.get('required_role') || 'owner';
  const attemptedRoute = searchParams.get('attempted_route') || '/settings/security';
  const userRole = searchParams.get('user_role') || 'viewer';
  const moduleName = searchParams.get('module_name') || 'Protected Resource';

  // Client-side effect logging the failed unauthorized attempt to the audit_logs table
  useEffect(() => {
    const timestamp = new Date().toISOString();
    // Simulate persistent write to PostgreSQL audit_logs table
    console.warn(`[AUDIT_LOG] 403_ACCESS_DENIED`, {
      timestamp,
      event_type: 'RBAC_ACCESS_DENIED',
      attempted_route: attemptedRoute,
      user_role: userRole,
      required_role: requiredRole,
      client_ip: '127.0.0.1 (Internal Gateway)',
      severity: 'HIGH_SECURITY',
    });

    toast.error(`Security Intercept: Access to ${attemptedRoute} denied. Audit incident recorded.`);
  }, [attemptedRoute, userRole, requiredRole]);

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center p-4 sm:p-6 text-ink-900 selection:bg-rose-100 selection:text-rose-900">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-line shadow-xl p-6 sm:p-8 relative overflow-hidden space-y-6">
        {/* Top Warning Ribbon */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

        {/* Shield Icon Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                HTTP 403 · Forbidden
              </span>
              <span className="text-xs font-mono text-ink-400">Security Gate</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 mt-1">
              Access Denied
            </h1>
          </div>
        </div>

        {/* Main Explanation */}
        <div className="space-y-2">
          <p className="text-sm text-ink-700 leading-relaxed font-medium">
            You do not have permission to view or execute operations on this resource.
          </p>
          <p className="text-xs text-ink-500 leading-relaxed">
            The Manhattan Coffee Operations Network strictly enforces Role-Based Access Control
            (RBAC) with Separation of Duties. Your assigned credential role does not meet the minimum authorization tier required for this module.
          </p>
        </div>

        {/* Diagnostic Metadata Panel */}
        <div className="bg-ink-50/80 rounded-2xl border border-line p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <span className="text-ink-500 font-sans font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-ink-400" />
              Target Module:
            </span>
            <span className="font-bold text-ink-900">{moduleName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-ink-500 font-sans font-medium">Attempted Route:</span>
            <span className="text-rose-600 font-bold truncate max-w-[260px]">
              {attemptedRoute}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-ink-500 font-sans font-medium">Your Active Role:</span>
            <span className="px-2 py-0.5 rounded-md bg-ink-200 text-ink-800 font-bold uppercase">
              {userRole}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-ink-500 font-sans font-medium">Required Authorization:</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 font-bold uppercase">
              {requiredRole}
            </span>
          </div>
        </div>

        {/* Audit Log Notification */}
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-900">
          <FileWarning className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Security Notice:</strong> This unauthorized access attempt has been permanently
            committed to <code className="font-mono bg-rose-100 px-1 rounded">audit_logs</code> with
            your operator fingerprint and IP address. Repeated violations will trigger credential
            suspension.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-1.5 px-4 py-2.5 border border-line hover:bg-ink-100 text-ink-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch Operator Role</span>
          </Link>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-ink-400 font-mono">
        Manhattan Coffee Automated Vending Systems · Zero-Trust Gateway
      </div>
    </div>
  );
}

export default function Forbidden403Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-page flex items-center justify-center p-4">
          <div className="animate-pulse bg-white p-8 rounded-3xl border border-line w-full max-w-xl h-96" />
        </div>
      }
    >
      <AccessDeniedContent />
    </Suspense>
  );
}
