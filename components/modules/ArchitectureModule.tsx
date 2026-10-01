'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import { ModuleId, UserRole } from '@/lib/types';
import {
  GitFork,
  Shield,
  Layers,
  Search,
  ExternalLink,
  Check,
  ChevronRight,
  ArrowRight,
  Smartphone,
  Monitor,
  Zap,
} from 'lucide-react';

export default function ArchitectureModule() {
  const { setModule, role, setRole } = useAdmin();
  const [activeSection, setActiveSection] = useState<'registry' | 'roles' | 'pipeline' | 'deeplinks'>('registry');
  const [registrySearch, setRegistrySearch] = useState('');

  const routeRegistry = [
    // ① Dashboard
    { route: '/', module: 'dashboard' as ModuleId, screen: 'Overview Dashboard', data: 'orders, wallets, telemetry, tanks', actions: 'Export report, Switch range, Quick add machine', role: 'viewer', grp: '① Dashboard' },
    // ② Machines
    { route: '/machines', module: 'machines' as ModuleId, screen: 'Fleet List', data: 'machines, stock, tanks', actions: 'Lock, Unlock, Reboot, Test dispense', role: 'viewer', grp: '② Machines' },
    { route: '/machines/:id/overview', module: 'machines' as ModuleId, screen: 'Live Machine Tile', data: 'telemetry (latest), machines', actions: 'Lock, Set mode, Set target temp', role: 'viewer', grp: '② Machines' },
    { route: '/machines/:id/telemetry', module: 'machines' as ModuleId, screen: 'Historical Telemetry', data: 'machine_telemetry (partitioned)', actions: 'Export CSV, Change window (24h/7d/30d)', role: 'viewer', grp: '② Machines' },
    { route: '/machines/:id/tanks', module: 'machines' as ModuleId, screen: 'Tank Lifecycle', data: 'machine_tanks, tank_events', actions: 'Mount new tank, Mark disposed, FSSAI log', role: 'ops', grp: '② Machines' },
    { route: '/machines/:id/stock', module: 'machines' as ModuleId, screen: 'Consumables & Kits', data: 'machine_stock, stock_events', actions: 'Log refill, Adjust threshold, Buffer check', role: 'ops', grp: '② Machines' },
    { route: '/machines/:id/hardware', module: 'machines' as ModuleId, screen: 'Hardware Diagnostics', data: 'firmware_versions, health_logs', actions: 'Push OTA, Rollback, Diagnostics', role: 'owner', grp: '② Machines' },
    { route: '/machines/:id/cameras', module: 'machines' as ModuleId, screen: 'Surveillance (2 channels)', data: 'cameras, video_clips', actions: 'Request 30s clip, Stream status', role: 'support', grp: '② Machines' },
    { route: '/machines/:id/commands', module: 'machines' as ModuleId, screen: 'MQTT Command Log', data: 'machine_commands', actions: 'Re-issue command, View JSON payload', role: 'viewer', grp: '② Machines' },
    { route: '/machines/:id/maintenance', module: 'machines' as ModuleId, screen: 'Service Log', data: 'maintenance_logs', actions: 'Schedule technician visit, Log task', role: 'ops', grp: '② Machines' },
    { route: '/machines/:id/settings', module: 'machines' as ModuleId, screen: 'Per-Machine Settings', data: 'machines config', actions: 'Target temp, hot/cold mode toggle', role: 'ops', grp: '② Machines' },
    // ③ Orders
    { route: '/orders', module: 'orders' as ModuleId, screen: 'Live Orders Queue', data: 'orders, payment_transactions', actions: 'Refund, Mark fraud, Filter queue', role: 'viewer', grp: '③ Orders' },
    { route: '/orders/:id', module: 'orders' as ModuleId, screen: 'Order Evidence Detail', data: 'orders, qr_codes, dispense_logs, tanks', actions: 'Refund, Mark fraud, Open dispute desk', role: 'viewer', grp: '③ Orders' },
    { route: '/orders/:id/label', module: 'orders' as ModuleId, screen: 'Print Receipt Stub', data: 'orders, dispense_logs', actions: 'Print A5 slip, Download PDF', role: 'viewer', grp: '③ Orders' },
    // ④ Customers
    { route: '/customers', module: 'customers' as ModuleId, screen: 'Customers Directory', data: 'users, profiles, stats, wallets', actions: 'Send push, Credit wallet, Block/unblock', role: 'viewer', grp: '④ Customers' },
    { route: '/customers/:id', module: 'customers' as ModuleId, screen: '360° Profile & Heatmap', data: 'users, consents, badges, leaderboard', actions: 'Credit wallet, Send push, Block user', role: 'support', grp: '④ Customers' },
    { route: '/customers/:id/wallet', module: 'customers' as ModuleId, screen: 'Wallet Running Ledger', data: 'wallets, transactions', actions: 'Export ledger, Manual credit/debit', role: 'finance', grp: '④ Customers' },
    { route: '/customers/:id/codes', module: 'customers' as ModuleId, screen: 'QR Codes History', data: 'qr_codes, events', actions: 'Revoke unredeemed, Reissue token', role: 'viewer', grp: '④ Customers' },
    // ⑤ Inventory
    { route: '/inventory', module: 'inventory' as ModuleId, screen: 'Fleet Stock Matrix', data: 'machine_stock, tanks', actions: 'Bulk refill, Export physical sheet', role: 'viewer', grp: '⑤ Inventory' },
    { route: '/inventory/tanks', module: 'inventory' as ModuleId, screen: 'Tanks Lifecycle', data: 'machine_tanks, fssai_certs', actions: 'Mount, Dispose, Export FSSAI evidence', role: 'ops', grp: '⑤ Inventory' },
    { route: '/inventory/supplies', module: 'inventory' as ModuleId, screen: 'Raw Supplies & Cost', data: 'kit_templates, components', actions: 'Adjust warehouse stock, Update unit cost', role: 'finance', grp: '⑤ Inventory' },
    { route: '/inventory/waste', module: 'inventory' as ModuleId, screen: 'Wastage Loss Log', data: 'stock_events, tank_events', actions: 'Log waste write-off, Export loss report', role: 'finance', grp: '⑤ Inventory' },
    // ⑥ Analytics
    { route: '/analytics/sales', module: 'analytics' as ModuleId, screen: 'Sales & Tier Mix', data: 'orders, payment_methods', actions: 'Tier mix analysis, Compare periods', role: 'viewer', grp: '⑥ Analytics' },
    { route: '/analytics/products', module: 'analytics' as ModuleId, screen: 'Variant Cannibalisation', data: 'orders, products', actions: 'Volume vs margin evaluation', role: 'viewer', grp: '⑥ Analytics' },
    { route: '/analytics/consumption', module: 'analytics' as ModuleId, screen: '24×7 Footfall Heatmap', data: 'orders hourly distribution', actions: 'Export matrix, Schedule refill routes', role: 'viewer', grp: '⑥ Analytics' },
    { route: '/analytics/machines', module: 'analytics' as ModuleId, screen: 'Fleet Unit Comparison', data: 'machines, health_logs', actions: 'Compare cups/day and uptime', role: 'viewer', grp: '⑥ Analytics' },
    { route: '/analytics/profitability', module: 'analytics' as ModuleId, screen: 'Gross Margins & LTV', data: 'orders, ad_revenue, bookings', actions: 'Break-even analysis, Set cost basis', role: 'finance', grp: '⑥ Analytics' },
    // ⑦ Marketing
    { route: '/marketing/offers', module: 'marketing' as ModuleId, screen: 'Offers & Budget Burn', data: 'offers, budgets', actions: 'Create offer, Pause, Set budget cap', role: 'marketing', grp: '⑦ Marketing' },
    { route: '/marketing/coupons', module: 'marketing' as ModuleId, screen: 'Coupon Codes Generator', data: 'coupons, redemptions', actions: 'Generate bulk coupons, Toggle status', role: 'marketing', grp: '⑦ Marketing' },
    { route: '/marketing/banners', module: 'marketing' as ModuleId, screen: 'In-App Banners Preview', data: 'banners, analytics', actions: 'Upload creative, Schedule banner', role: 'marketing', grp: '⑦ Marketing' },
    { route: '/marketing/push', module: 'marketing' as ModuleId, screen: 'Push Broadcast Composer', data: 'push_notifications', actions: 'Send instant broadcast, Segment filter', role: 'marketing', grp: '⑦ Marketing' },
    { route: '/marketing/festivals', module: 'marketing' as ModuleId, screen: 'Seasonal Mode Switch', data: 'app_config, fleet_modes', actions: 'Master Hot/Cold fleet switch', role: 'marketing', grp: '⑦ Marketing' },
    { route: '/marketing/adspaces', module: 'marketing' as ModuleId, screen: 'Machine Ad Space Rentals', data: 'ad_spaces, bookings', actions: 'Book physical panels, Invoices', role: 'finance', grp: '⑦ Marketing' },
    // ⑧ Support
    { route: '/support', module: 'support' as ModuleId, screen: '5-Min SLA Guarantee Board', data: 'support_tickets, sla_timers', actions: 'Claim next priority, Live countdown', role: 'support', grp: '⑧ Support' },
    { route: '/support/tickets', module: 'support' as ModuleId, screen: 'Support Claims Queue', data: 'tickets, users, machines', actions: 'Filter, Prioritize, Assign ticket', role: 'support', grp: '⑧ Support' },
    { route: '/support/tickets/:id', module: 'support' as ModuleId, screen: 'Dispute Desk (Evidence)', data: 'tickets, camera_clips, sensor_logs', actions: 'Approve refund, Reject proof, Blacklist', role: 'support', grp: '⑧ Support' },
    { route: '/support/refunds', module: 'support' as ModuleId, screen: 'Financial Refunds Queue', data: 'refunds, gateway_txns', actions: 'Authorize bank payout batch', role: 'finance', grp: '⑧ Support' },
    { route: '/support/reviews', module: 'support' as ModuleId, screen: 'Customer Reviews Rating', data: 'feedback_ratings', actions: 'Inspect 1-3 star feedback, reply', role: 'support', grp: '⑧ Support' },
    { route: '/support/blacklist', module: 'support' as ModuleId, screen: 'Fraud Identity Blacklist', data: 'fraud_blacklist', actions: 'Add phone/UTR/device to blacklist', role: 'owner', grp: '⑧ Support' },
    // ⑨ Settings
    { route: '/settings/general', module: 'settings' as ModuleId, screen: 'General Brand Settings', data: 'app_config', actions: 'Save company details, support hotline', role: 'owner', grp: '⑨ Settings' },
    { route: '/settings/machines', module: 'settings' as ModuleId, screen: 'Fleet Default Baselines', data: 'app_config, fleet_defaults', actions: 'Default target temperatures, hold hours', role: 'ops', grp: '⑨ Settings' },
    { route: '/settings/payments', module: 'settings' as ModuleId, screen: 'Gateway Webhooks & Secrets', data: 'integrations, razorpay_keys', actions: 'Save live keys, test ping webhooks', role: 'owner', grp: '⑨ Settings' },
    { route: '/settings/notifications', module: 'settings' as ModuleId, screen: 'Alert Rules Matrix', data: 'alert_rules', actions: 'Configure escalation thresholds', role: 'owner', grp: '⑨ Settings' },
    { route: '/settings/team', module: 'settings' as ModuleId, screen: 'Team Admins & RBAC Roles', data: 'admin_users, roles', actions: 'Invite admin, assign roles, enforce MFA', role: 'owner', grp: '⑨ Settings' },
    { route: '/settings/security', module: 'settings' as ModuleId, screen: 'QR Signing Secret Rotation', data: 'hmac_keys, audit_logs', actions: 'Rotate master signing secret, view diffs', role: 'owner', grp: '⑨ Settings' },
    { route: '/settings/billing', module: 'settings' as ModuleId, screen: 'Fleet Plan & Billing', data: 'subscription_plans', actions: 'Upgrade machine licenses, invoices', role: 'owner', grp: '⑨ Settings' },
  ];

  const filteredRegistry = routeRegistry.filter(
    (r) =>
      r.route.toLowerCase().includes(registrySearch.toLowerCase()) ||
      r.screen.toLowerCase().includes(registrySearch.toLowerCase()) ||
      r.grp.toLowerCase().includes(registrySearch.toLowerCase()) ||
      r.role.toLowerCase().includes(registrySearch.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded uppercase">
              Specification Architecture
            </span>
            <span className="text-xs text-ink-400">·</span>
            <span className="text-xs text-ink-500 font-mono">9 Modules · 56 Routes · 6 Roles</span>
          </div>
          <h1 className="text-[24px] font-bold tracking-tight text-ink-900 mt-1">
            Admin Panel Routing &amp; Page Architecture
          </h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            Full specification blueprint from <code className="font-mono text-brand-600">admin-routing-workflow.html</code>.
          </p>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="flex items-center gap-3">
          <div className="card px-3.5 py-2 text-center bg-white border-line shadow-xs">
            <p className="text-[10px] text-ink-400 font-bold uppercase">Modules</p>
            <p className="text-lg font-bold text-ink-900 font-mono">9</p>
          </div>
          <div className="card px-3.5 py-2 text-center bg-white border-line shadow-xs">
            <p className="text-[10px] text-ink-400 font-bold uppercase">Routes</p>
            <p className="text-lg font-bold text-ink-900 font-mono">56</p>
          </div>
          <div className="card px-3.5 py-2 text-center bg-white border-line shadow-xs">
            <p className="text-[10px] text-ink-400 font-bold uppercase">DB Tables</p>
            <p className="text-lg font-bold text-ink-900 font-mono">68</p>
          </div>
          <div className="card px-3.5 py-2 text-center bg-white border-line shadow-xs">
            <p className="text-[10px] text-ink-400 font-bold uppercase">Roles</p>
            <p className="text-lg font-bold text-brand-600 font-mono">6</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-line text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSection('registry')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeSection === 'registry'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Master Route Registry ({routeRegistry.length})
        </button>
        <button
          onClick={() => setActiveSection('roles')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeSection === 'roles'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Role → Route Reach Matrix
        </button>
        <button
          onClick={() => setActiveSection('pipeline')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeSection === 'pipeline'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Guard Pipeline &amp; Dispute Desk Hydration
        </button>
        <button
          onClick={() => setActiveSection('deeplinks')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeSection === 'deeplinks'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Deep Links &amp; Responsive Surfaces
        </button>
      </div>

      {/* 1. MASTER REGISTRY TABLE */}
      {activeSection === 'registry' && (
        <div className="space-y-4">
          <div className="card p-3.5 border-line flex flex-wrap items-center justify-between gap-3 bg-page/40">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Filter routes, screens or data sources..."
                value={registrySearch}
                onChange={(e) => setRegistrySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-line rounded-lg text-xs bg-white outline-none focus:border-brand-500"
              />
            </div>
            <p className="text-xs text-ink-500">
              Click any route to jump directly into the live functioning module!
            </p>
          </div>

          <div className="card overflow-hidden border-line">
            <table className="w-full text-left text-xs">
              <thead className="bg-page border-b border-line text-ink-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Route Path</th>
                  <th className="py-2.5 px-4">Screen / Module</th>
                  <th className="py-2.5 px-4">Primary Read Data</th>
                  <th className="py-2.5 px-4">Actions Emitted</th>
                  <th className="py-2.5 px-4">Min Role</th>
                  <th className="py-2.5 px-4 text-right">Jump</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredRegistry.map((item, idx) => (
                  <tr key={idx} className="hover:bg-page/50 group">
                    <td className="py-2.5 px-4 font-mono font-bold text-brand-700">
                      {item.route}
                    </td>
                    <td className="py-2.5 px-4">
                      <p className="font-semibold text-ink-900">{item.screen}</p>
                      <p className="text-[10px] text-ink-400">{item.grp}</p>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-ink-600">
                      {item.data}
                    </td>
                    <td className="py-2.5 px-4 text-ink-600">{item.actions}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          item.role === 'owner'
                            ? 'bg-brand-50 text-brand-700'
                            : item.role === 'ops'
                            ? 'bg-leaf-50 text-leaf-700'
                            : item.role === 'support'
                            ? 'bg-amber2-50 text-amber2-700'
                            : item.role === 'finance'
                            ? 'bg-blue-50 text-blue-700'
                            : item.role === 'marketing'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => setModule(item.module)}
                        className="px-2 py-1 rounded bg-page group-hover:bg-brand-50 text-brand-600 font-bold text-[11px] transition flex items-center gap-1 ml-auto"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ROLE MATRIX */}
      {activeSection === 'roles' && (
        <div className="space-y-4">
          <div className="card overflow-hidden border-line">
            <div className="p-4 border-b border-line bg-page text-xs font-bold text-ink-900 flex justify-between">
              <span>Role → Route Reach Matrix (Evaluated by Route Guards)</span>
              <span className="text-ink-400 font-normal">
                Guards deny with 403 rather than hiding buttons
              </span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-page/70 text-[10px] text-ink-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Module / Capability</th>
                  <th className="py-3 px-3 text-center">viewer</th>
                  <th className="py-3 px-3 text-center">support</th>
                  <th className="py-3 px-3 text-center">ops</th>
                  <th className="py-3 px-3 text-center">marketing</th>
                  <th className="py-3 px-3 text-center">finance</th>
                  <th className="py-3 px-3 text-center text-brand-700">owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  { name: 'Dashboard (Read metrics, trend canvas)', v: true, s: true, o: true, m: true, f: true, w: true },
                  { name: 'Machines (Read live telemetry)', v: true, s: true, o: true, m: true, f: true, w: true },
                  { name: 'Machines (Tanks / Stock / Settings write)', v: false, s: false, o: true, m: false, f: false, w: true },
                  { name: 'Machines (Hardware / OTA firmware updates)', v: false, s: false, o: false, m: false, f: false, w: true },
                  { name: 'Machines (Lock / Reboot / Test pour)', v: false, s: false, o: true, m: false, f: false, w: true },
                  { name: 'Orders (Read queue and telemetry)', v: true, s: true, o: true, m: true, f: true, w: true },
                  { name: 'Customers (Read profile & heatmap)', v: false, s: true, o: false, m: true, f: true, w: true },
                  { name: 'Customers (Wallet ledger manual adjustment)', v: false, s: false, o: false, m: false, f: true, w: true },
                  { name: 'Inventory (Read matrix & tanks)', v: true, s: true, o: true, m: false, f: true, w: true },
                  { name: 'Inventory (Cost basis & write-off logs)', v: false, s: false, o: false, m: false, f: true, w: true },
                  { name: 'Analytics (Sales & consumption heatmaps)', v: true, s: true, o: true, m: true, f: true, w: true },
                  { name: 'Analytics (Unit economics & profitability)', v: false, s: false, o: false, m: false, f: true, w: true },
                  { name: 'Marketing (Offers / Coupons / Banners / Push)', v: false, s: false, o: false, m: true, f: false, w: true },
                  { name: 'Support (Tickets & Dispute Desk inspection)', v: false, s: true, o: true, m: false, f: true, w: true },
                  { name: 'Support (Approve Financial Refund Payout)', v: false, s: false, o: true, m: false, f: true, w: true },
                  { name: 'Support (Fraud identity blacklisting)', v: false, s: false, o: false, m: false, f: false, w: true },
                  { name: 'Settings (Secrets rotation / Team / Gateway keys)', v: false, s: false, o: false, m: false, f: false, w: true },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-page/50">
                    <td className="py-2.5 px-4 font-semibold text-ink-900">{row.name}</td>
                    <td className="py-2.5 px-3 text-center">{row.v ? <Check className="w-4 h-4 text-leaf-600 inline" /> : '·'}</td>
                    <td className="py-2.5 px-3 text-center">{row.s ? <Check className="w-4 h-4 text-leaf-600 inline" /> : '·'}</td>
                    <td className="py-2.5 px-3 text-center">{row.o ? <Check className="w-4 h-4 text-leaf-600 inline" /> : '·'}</td>
                    <td className="py-2.5 px-3 text-center">{row.m ? <Check className="w-4 h-4 text-leaf-600 inline" /> : '·'}</td>
                    <td className="py-2.5 px-3 text-center">{row.f ? <Check className="w-4 h-4 text-leaf-600 inline" /> : '·'}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-brand-600">{row.w ? <Check className="w-4 h-4 text-brand-600 inline" /> : '·'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PIPELINE & HYDRATION FLOW */}
      {activeSection === 'pipeline' && (
        <div className="space-y-6 text-xs">
          <div className="card p-5 border-line space-y-3">
            <h3 className="text-sm font-bold text-ink-900">
              Dispute Desk Single-Payload Hydration Sequence
            </h3>
            <p className="text-ink-600 leading-relaxed">
              When an operator opens <code className="font-mono text-brand-600">/support/tickets/:id</code>, one atomic RPC call loads the entire evidence bundle: ticket + order + dispense telemetry + payment UTR + code events + machine health window + tank certification.
            </p>
            <div className="p-4 bg-ink-900 text-emerald-400 font-mono text-[11.5px] rounded-xl space-y-1">
              <p className="text-white font-bold">Execution Step Sequence:</p>
              <p>1. GET /api/v1/tickets/:id/evidence_bundle</p>
              <p>2. SQL fn_ticket_evidence_bundle(ticket_id)</p>
              <p>3. PARALLEL: Camera clip extraction (signed URL) + Sensor logs (valve ms, pulses, variance)</p>
              <p>4. Evaluates: If variance &gt; 15% → UI triggers high warning banner for operator</p>
              <p>5. Verdict Bar emits either legimate_refund or rejected_with_proof</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. DEEP LINKS & RESPONSIVE */}
      {activeSection === 'deeplinks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="card p-5 border-line space-y-3">
            <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-brand-500" />
              <span>Web Console Surface</span>
            </h3>
            <p className="text-ink-600 leading-relaxed">
              Desktop browsers land on <code className="font-mono text-brand-600">/</code> (Dashboard Overview). Full 56 routes reachable with wide tables and side-by-side evidence panes.
            </p>
          </div>

          <div className="card p-5 border-line space-y-3">
            <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-leaf-600" />
              <span>Mobile Phone Surface</span>
            </h3>
            <p className="text-ink-600 leading-relaxed">
              Mobile browsers adaptive routing defaults to <code className="font-mono text-brand-600">/support</code> (SLA Guarantee Board) because that is the emergency dispatch screen an on-the-go operator needs when an alert fires.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
