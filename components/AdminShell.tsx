'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Toast from '@/components/Toast';
import { ROLE_PERMISSIONS } from '@/lib/mock-data';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const { role, setRole } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Determine current module from URL pathname
  let currentModuleKey = 'dashboard';
  if (pathname.startsWith('/machines')) currentModuleKey = 'machines';
  else if (pathname.startsWith('/orders')) currentModuleKey = 'orders';
  else if (pathname.startsWith('/customers')) currentModuleKey = 'customers';
  else if (pathname.startsWith('/inventory')) currentModuleKey = 'inventory';
  else if (pathname.startsWith('/analytics')) currentModuleKey = 'analytics';
  else if (pathname.startsWith('/marketing')) currentModuleKey = 'marketing';
  else if (pathname.startsWith('/support')) currentModuleKey = 'support';
  else if (pathname.startsWith('/settings')) currentModuleKey = 'settings';
  else if (pathname.startsWith('/architecture')) currentModuleKey = 'architecture';

  const perm = ROLE_PERMISSIONS[role];
  const isAllowed = perm.allowedModules.includes(currentModuleKey);

  return (
    <div className="flex min-h-screen bg-page text-ink-900">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 min-w-0 pb-12">
          {!isAllowed ? (
            <div className="p-8 max-w-lg mx-auto text-center space-y-4 my-16">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-ink-900">
                403 · Insufficient Role Permissions
              </h2>
              <p className="text-xs text-ink-500 leading-relaxed">
                Your active persona role <b className="capitalize text-ink-900">{role}</b> does not grant permission to view the <b className="capitalize">{currentModuleKey}</b> module. This guard denial is enforced server-side and client-side per the RBAC contract.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => setRole('owner')}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Elevate to Owner (Root) Persona
                </button>
                <Link
                  href="/"
                  className="px-4 py-2 bg-white border border-line text-ink-700 hover:bg-page rounded-lg text-xs font-semibold"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Floating Global Toasts */}
      <Toast />
    </div>
  );
}
