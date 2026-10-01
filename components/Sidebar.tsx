'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import {
  LayoutDashboard,
  Cpu,
  ShoppingBag,
  Users,
  Boxes,
  TrendingUp,
  Megaphone,
  Headset,
  Settings,
  GitFork,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { orders, tickets, machines, setModule } = useAdmin();
  const pathname = usePathname();

  const activeMachinesCount = machines.filter((m) => m.status === 'ONLINE').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'OPEN').length;

  const isNavActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard, section: 'Operations', badge: null },
    { label: 'Machines', href: '/machines', icon: Cpu, section: 'Operations', badge: activeMachinesCount, badgeColor: 'bg-leaf-50 text-leaf-600' },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, section: 'Operations', badge: orders.length, badgeColor: 'bg-brand-50 text-brand-600' },
    { label: 'Customers', href: '/customers', icon: Users, section: 'Operations', badge: null },
    { label: 'Inventory', href: '/inventory', icon: Boxes, section: 'Operations', badge: null },
    { label: 'Analytics', href: '/analytics', icon: TrendingUp, section: 'Growth', badge: null },
    { label: 'Marketing', href: '/marketing', icon: Megaphone, section: 'Growth', badge: null },
    { label: 'Support', href: '/support', icon: Headset, section: 'Growth', badge: openTicketsCount, badgeColor: 'bg-brand-500 text-white' },
    { label: 'Settings', href: '/settings', icon: Settings, section: 'Growth', badge: null },
  ];

  return (
    <>
      {/* Mobile Scrim */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`w-[250px] shrink-0 bg-white border-r border-line flex flex-col fixed lg:static inset-y-0 z-50 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-[68px] flex items-center justify-between px-5 border-b border-line shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-[15px] shadow-xs">
              M
            </div>
            <div className="leading-tight">
              <p className="text-[15px] font-bold tracking-tight text-ink-900">
                Manhattan<span className="text-brand-500">Coffee</span>
              </p>
              <p className="text-[11px] text-ink-500">Vending Network</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-ink-400 hover:text-ink-700 hover:bg-page transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            Operations
          </p>

          {navItems
            .filter((i) => i.section === 'Operations')
            .map((item) => {
              const active = isNavActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    const mod = item.href === '/' ? 'dashboard' : item.href.slice(1);
                    setModule(mod as any);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition text-left cursor-pointer ${
                    active
                      ? 'bg-brand-500 text-white font-semibold shadow-xs'
                      : 'text-ink-700 hover:bg-page'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0 opacity-80" />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                        active ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

          <p className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            Growth
          </p>

          {navItems
            .filter((i) => i.section === 'Growth')
            .map((item) => {
              const active = isNavActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setModule(item.href.slice(1) as any);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition text-left cursor-pointer ${
                    active
                      ? 'bg-brand-500 text-white font-semibold shadow-xs'
                      : 'text-ink-700 hover:bg-page'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0 opacity-80" />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                        active ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

          <p className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            Reference
          </p>

          <Link
            href="/architecture"
            onClick={() => {
              setModule('architecture');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition text-left cursor-pointer border ${
              isNavActive('/architecture')
                ? 'bg-ink-900 text-white border-ink-900 font-semibold shadow-xs'
                : 'border-line text-ink-700 hover:bg-brand-50 hover:border-brand-200'
            }`}
          >
            <GitFork className="w-[18px] h-[18px] shrink-0 text-brand-500" />
            <div className="leading-tight">
              <span className="block font-medium">Route Blueprint</span>
              <span className="text-[10px] text-ink-400 block">56 Routes &amp; Roles</span>
            </div>
          </Link>
        </nav>

        {/* Upgrade card */}
        <div className="p-3 shrink-0">
          <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 relative overflow-hidden">
            <div className="text-[26px] leading-none mb-2">☕</div>
            <p className="text-[13px] font-bold text-ink-900">Go Pro</p>
            <p className="text-[11.5px] text-ink-500 mt-1 leading-relaxed">
              Unlock multi-machine fleet, subscriptions &amp; advanced fraud rules.
            </p>
            <Link
              href="/settings/billing"
              onClick={onClose}
              className="mt-3 block text-center w-full bg-brand-500 hover:bg-brand-600 text-white text-[12px] font-semibold rounded-lg py-2 transition shadow-xs cursor-pointer"
            >
              Manage Fleet Plan
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
