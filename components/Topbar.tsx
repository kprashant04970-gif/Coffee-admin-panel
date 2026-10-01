'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '@/lib/admin-context';
import { UserRole } from '@/lib/types';
import { ROLE_PERMISSIONS } from '@/lib/mock-data';
import ThemeDisplayPopover from '@/components/ThemeDisplayPopover';
import {
  Menu,
  Search,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  Check,
  ShieldCheck,
  ExternalLink,
  Cpu,
  ShoppingBag,
  Users,
  Headset,
} from 'lucide-react';

interface TopbarProps {
  onOpenSidebar: () => void;
}

export default function Topbar({ onOpenSidebar }: TopbarProps) {
  const {
    role,
    setRole,
    module,
    setModule,
    searchQuery,
    setSearchQuery,
    machines,
    orders,
    customers,
    tickets,
    notifications,
    markNotificationRead,
    navigateToMachine,
    navigateToOrder,
    navigateToTicket,
    navigateToCustomer,
  } = useAdmin();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  // Search results preview
  const filteredMachines = searchQuery.trim()
    ? machines.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredOrders = searchQuery.trim()
    ? orders.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.variant.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredTickets = searchQuery.trim()
    ? tickets.filter(
        (t) =>
          t.ticketNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.reasonLabel.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const hasSearchResults =
    filteredMachines.length > 0 || filteredOrders.length > 0 || filteredTickets.length > 0;

  const rolesList: UserRole[] = ['owner', 'ops', 'support', 'marketing', 'finance', 'viewer'];

  const getPageTitle = () => {
    switch (module) {
      case 'dashboard':
        return 'Operations Dashboard';
      case 'machines':
        return 'Vending Fleet & Telemetry';
      case 'orders':
        return 'Live Orders Queue';
      case 'customers':
        return 'Customer 360° Directory';
      case 'inventory':
        return 'Inventory & Tanks Lifecycle';
      case 'analytics':
        return 'Performance Analytics';
      case 'marketing':
        return 'Growth & Campaigns';
      case 'support':
        return 'Support & Dispute Desk';
      case 'settings':
        return 'Fleet & Security Settings';
      case 'architecture':
        return 'Routing Architecture & Role Matrix';
      default:
        return 'Operations';
    }
  };

  return (
    <header className="h-[68px] bg-white border-b border-line flex items-center gap-3 sm:gap-4 px-4 sm:px-6 shrink-0 sticky top-0 z-30">
      <button
        onClick={onOpenSidebar}
        className="lg:hidden w-9 h-9 rounded-lg border border-line flex items-center justify-center text-ink-700 hover:bg-page transition cursor-pointer"
        aria-label="Open navigation sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Module Title */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-[15px] font-bold text-ink-900 tracking-tight">
          {getPageTitle()}
        </span>
        <span className="text-xs text-ink-400 font-mono hidden md:inline">/</span>
        <span className="text-xs text-ink-500 font-mono hidden md:inline">{module}</span>
      </div>

      <div className="flex-1" />

      {/* Search Input */}
      <div className="relative flex-1 max-w-[280px] sm:max-w-[320px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          placeholder="Search machines, orders, tickets..."
          className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-[13px] bg-page border border-line rounded-lg outline-none focus:border-brand-500 focus:bg-white transition"
        />

        {/* Live Search Popup */}
        {searchFocused && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-xl shadow-lg p-2 max-h-80 overflow-y-auto z-50">
            {!hasSearchResults ? (
              <p className="p-3 text-xs text-ink-500 text-center">
                No matching results found for &ldquo;{searchQuery}&rdquo;
              </p>
            ) : (
              <div className="space-y-2">
                {filteredMachines.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-[10px] uppercase font-semibold text-ink-400">
                      Machines
                    </p>
                    {filteredMachines.slice(0, 3).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          navigateToMachine(m.id);
                          setSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-page flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Cpu className="w-3.5 h-3.5 text-brand-500" />
                          <span className="font-semibold text-ink-900">{m.name}</span>
                          <span className="text-ink-400 font-mono">{m.code}</span>
                        </div>
                        <span className="text-[10px] text-leaf-600 font-semibold">{m.temp}°C</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredOrders.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-[10px] uppercase font-semibold text-ink-400">
                      Orders
                    </p>
                    {filteredOrders.slice(0, 3).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          navigateToOrder(o.id);
                          setSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-page flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-3.5 h-3.5 text-amber2-600" />
                          <span className="font-semibold text-ink-900">{o.orderNo}</span>
                          <span className="text-ink-500 truncate max-w-[120px]">{o.variant}</span>
                        </div>
                        <span className="font-bold text-ink-900">₹{o.netAmount}</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredTickets.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-[10px] uppercase font-semibold text-ink-400">
                      Disputes & Tickets
                    </p>
                    {filteredTickets.slice(0, 3).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          navigateToTicket(t.id);
                          setSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-page flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Headset className="w-3.5 h-3.5 text-brand-500" />
                          <span className="font-semibold text-ink-900">{t.ticketNo}</span>
                          <span className="text-ink-500 truncate max-w-[120px]">{t.customerName}</span>
                        </div>
                        <span className="text-brand-600 font-semibold">{t.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Role Switcher (RBAC Controller) */}
      <div className="relative" ref={roleRef}>
        <button
          onClick={() => setRoleMenuOpen(!roleMenuOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line bg-page hover:bg-white text-[12px] font-medium text-ink-700 transition cursor-pointer"
          title="Switch Active Persona & Roles"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
          <span className="font-semibold capitalize hidden sm:inline">{role}</span>
          <ChevronDown className="w-3 h-3 text-ink-400" />
        </button>

        {roleMenuOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white border border-line rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1">
            <div className="px-3 pb-2 mb-1 border-b border-line">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                Persona & Access Guard
              </p>
              <p className="text-[11px] text-ink-500">
                Toggle roles to test the RBAC permissions matrix and route guards.
              </p>
            </div>
            <div className="space-y-0.5 px-1">
              {rolesList.map((r) => {
                const p = ROLE_PERMISSIONS[r];
                const active = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                      active ? 'bg-brand-50 text-brand-700 font-semibold' : 'hover:bg-page text-ink-700'
                    }`}
                  >
                    <div>
                      <p className="font-medium capitalize flex items-center gap-1.5">
                        {r}
                        {r === 'owner' && <span className="text-[10px] text-brand-600 font-bold">(All)</span>}
                      </p>
                      <p className="text-[10px] text-ink-400 mt-0.5">{p.label}</p>
                    </div>
                    {active && <Check className="w-4 h-4 text-brand-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Theme & Display Appearance Controller */}
      <ThemeDisplayPopover />

      {/* Notifications Popover with Deep Links */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifMenuOpen(!notifMenuOpen)}
          className="relative w-9 h-9 rounded-lg border border-line flex items-center justify-center hover:bg-page transition cursor-pointer text-ink-700"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadNotifs > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadNotifs}
            </span>
          )}
        </button>

        {notifMenuOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-line rounded-xl shadow-lg py-2 z-50">
            <div className="px-4 py-2 border-b border-line flex items-center justify-between">
              <div>
                <p className="text-[12px] font-bold text-ink-900">Live Alerts & Dispatches</p>
                <p className="text-[10px] text-ink-400">Clicking an alert navigates directly to context</p>
              </div>
              <span className="text-[11px] font-semibold text-brand-500">
                {unreadNotifs} unread
              </span>
            </div>
            <div className="divide-y divide-line max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    setNotifMenuOpen(false);
                    if (n.targetModule === 'machines' && n.targetId) {
                      navigateToMachine(n.targetId);
                    } else if (n.targetModule === 'support' && n.targetId) {
                      navigateToTicket(n.targetId);
                    } else {
                      setModule(n.targetModule);
                    }
                  }}
                  className={`p-3 text-left hover:bg-page cursor-pointer transition flex items-start gap-2.5 ${
                    !n.read ? 'bg-brand-50/40' : ''
                  }`}
                >
                  <span className="text-base shrink-0 mt-0.5">
                    {n.type === 'fault'
                      ? '⚠️'
                      : n.type === 'ticket'
                      ? '🚨'
                      : n.type === 'stock'
                      ? '🥛'
                      : '☕'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-ink-900">{n.title}</p>
                    <p className="text-[11.5px] text-ink-500 leading-snug mt-0.5">{n.description}</p>
                    <p className="text-[10px] text-ink-400 mt-1 font-mono">{n.time}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-ink-400 shrink-0 self-center" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Blueprint Quick Button */}
      <button
        onClick={() => setModule('architecture')}
        className="w-9 h-9 rounded-lg border border-line flex items-center justify-center hover:bg-page transition cursor-pointer text-ink-700 hidden sm:flex"
        title="View 56-Route Architecture & Flow Blueprint"
      >
        <SlidersHorizontal className="w-[18px] h-[18px]" />
      </button>

      {/* Profile Lockup */}
      <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-line">
        <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
          CR
        </div>
        <div className="hidden sm:block leading-tight text-left">
          <p className="text-[13px] font-semibold text-ink-900">Chief Rohan</p>
          <p className="text-[11px] text-ink-500 capitalize">{role}</p>
        </div>
      </div>
    </header>
  );
}
