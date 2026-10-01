'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import {
  Megaphone,
  Ticket,
  Image as ImageIcon,
  Bell,
  Sparkles,
  Users,
  Tv,
  Store,
  Plus,
  Play,
  Pause,
  Send,
  Eye,
  Flame,
} from 'lucide-react';

export default function MarketingModule() {
  const {
    coupons,
    banners,
    pushNotifications,
    adSpaces,
    createCoupon,
    toggleCouponStatus,
    sendPushNotification,
    toggleMasterMode,
    toast,
  } = useAdmin();

  const [subView, setSubView] = useState<
    'overview' | 'coupons' | 'banners' | 'push' | 'festivals' | 'ads' | 'adspaces'
  >('overview');

  // New Coupon form
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [cpnCode, setCpnCode] = useState('');
  const [cpnTitle, setCpnTitle] = useState('');
  const [cpnType, setCpnType] = useState<'FLAT' | 'PERCENT'>('FLAT');
  const [cpnValue, setCpnValue] = useState(15);
  const [cpnBudget, setCpnBudget] = useState(5000);

  // Push composer
  const [pushTitle, setPushTitle] = useState('☕ Flash Offer: 20% off Velvet Roast');
  const [pushBody, setPushBody] = useState('Today only at Campus Hub & Mall Lane. Valid till 4 PM.');
  const [pushSegment, setPushSegment] = useState('Active Today');

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpnCode.trim()) return;
    createCoupon(cpnCode, cpnTitle || cpnCode, cpnType, cpnValue, cpnBudget);
    setCpnCode('');
    setCpnTitle('');
    setCouponModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-ink-900">
            Growth, Loyalty &amp; Ad Revenues
          </h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            Coupons with budget burn limits, app banners, push notifications, and machine ad spaces.
          </p>
        </div>

        <button
          onClick={() => setCouponModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Sub Navigation */}
      <div className="flex border-b border-line text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setSubView('overview')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subView === 'overview'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSubView('coupons')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subView === 'coupons'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Coupons &amp; Offers
        </button>
        <button
          onClick={() => setSubView('banners')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subView === 'banners'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          App Banners (Phone Frame)
        </button>
        <button
          onClick={() => setSubView('push')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subView === 'push'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Push Broadcasts
        </button>
        <button
          onClick={() => setSubView('festivals')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subView === 'festivals'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Festival &amp; Seasonal Mode
        </button>
        <button
          onClick={() => setSubView('adspaces')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subView === 'adspaces'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Machine Ad Rentals
        </button>
      </div>

      {/* 1. OVERVIEW */}
      {subView === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4.5 border-line">
              <p className="text-xs text-ink-500">Active Coupons</p>
              <p className="text-2xl font-bold font-mono text-ink-900 mt-1">
                {coupons.filter((c) => c.status === 'ACTIVE').length} Active
              </p>
              <p className="text-xs text-leaf-600 mt-1">₹3,910 burned this month</p>
            </div>
            <div className="card p-4.5 border-line">
              <p className="text-xs text-ink-500">Ad Network Income</p>
              <p className="text-2xl font-bold font-mono text-brand-600 mt-1">₹1,240</p>
              <p className="text-xs text-ink-400 mt-1">Rewarded video CPM: ₹240</p>
            </div>
            <div className="card p-4.5 border-line">
              <p className="text-xs text-ink-500">Machine Ad Space Rentals</p>
              <p className="text-2xl font-bold font-mono text-ink-900 mt-1">₹19,200/mo</p>
              <p className="text-xs text-leaf-600 mt-1">3 slots booked</p>
            </div>
            <div className="card p-4.5 border-line">
              <p className="text-xs text-ink-500">Referral Conversion</p>
              <p className="text-2xl font-bold font-mono text-leaf-600 mt-1">42.8%</p>
              <p className="text-xs text-ink-400 mt-1">Anti-device-fingerprint clean</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. COUPONS & OFFERS */}
      {subView === 'coupons' && (
        <div className="card overflow-hidden border-line">
          <div className="p-4 border-b border-line bg-page text-xs font-bold text-ink-900">
            Active Discount Codes &amp; Budget Caps
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-page/70 text-[10px] text-ink-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Campaign Title</th>
                <th className="py-3 px-4">Benefit</th>
                <th className="py-3 px-4">Budget Burn Bar</th>
                <th className="py-3 px-4">Redemptions</th>
                <th className="py-3 px-4 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((c) => {
                const burnPct = Math.round((c.budgetBurned / c.budgetCap) * 100);
                return (
                  <tr key={c.id} className="hover:bg-page/50">
                    <td className="py-3 px-4 font-mono font-bold text-brand-600">{c.code}</td>
                    <td className="py-3 px-4 font-semibold text-ink-900">{c.title}</td>
                    <td className="py-3 px-4 font-mono">
                      {c.type === 'FLAT' ? `₹${c.value} OFF` : `${c.value}% OFF`}
                    </td>
                    <td className="py-3 px-4 w-52">
                      <div className="tier-bar">
                        <i style={{ width: `${burnPct}%`, background: '#F04E23' }} />
                      </div>
                      <span className="text-[10px] text-ink-400 font-mono">
                        ₹{c.budgetBurned} / ₹{c.budgetCap} ({burnPct}%)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{c.usageCount} users</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleCouponStatus(c.id)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                          c.status === 'ACTIVE'
                            ? 'bg-leaf-50 text-leaf-700 hover:bg-leaf-100'
                            : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                        }`}
                      >
                        {c.status}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. BANNERS (Phone Frame Preview) */}
      {subView === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-4 border-line">
              <h3 className="text-sm font-bold text-ink-900 mb-2">In-App Banner Placements</h3>
              <div className="space-y-3">
                {banners.map((b) => (
                  <div key={b.id} className="p-3.5 border border-line rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand-600 uppercase">{b.placement}</span>
                      <p className="text-xs font-bold text-ink-900 mt-0.5">{b.title}</p>
                      <p className="text-[11px] text-ink-400 font-mono mt-1">
                        {b.impressions} impressions · {b.clicks} clicks (
                        {((b.clicks / b.impressions) * 100).toFixed(1)}% CTR)
                      </p>
                    </div>
                    <span className="text-xs text-leaf-600 font-bold bg-leaf-50 px-2 py-0.5 rounded">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Mobile Phone Frame */}
          <div className="card p-4 border-line flex flex-col items-center">
            <p className="text-xs font-bold text-ink-900 mb-3">Live Customer App Preview</p>
            <div className="w-[280px] h-[520px] rounded-[36px] border-4 border-ink-900 bg-page shadow-pop p-3 flex flex-col justify-between relative overflow-hidden">
              <div className="w-24 h-4 bg-ink-900 rounded-full mx-auto mb-2" />
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">ManhattanCoffee</span>
                  <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-bold">
                    Campus Hub
                  </span>
                </div>
                {/* Simulated Carousel Banner */}
                <div className="rounded-xl p-4 text-white bg-gradient-to-r from-brand-500 to-brand-600 shadow-xs">
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">Featured Batch</span>
                  <p className="text-xs font-bold mt-1">Manhattan Velvet Crown Roast</p>
                  <p className="text-[10px] mt-1 opacity-90">Fresh batch mounted at 65.4°C</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-line">
                    <p className="font-bold">Hot Velvet</p>
                    <p className="text-[10px] text-brand-600 font-mono">₹50</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-line">
                    <p className="font-bold">Classic Latte</p>
                    <p className="text-[10px] text-brand-600 font-mono">₹20</p>
                  </div>
                </div>
              </div>
              <div className="py-2 text-center text-[10px] text-ink-400 border-t border-line">
                Scan QR to Pour
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PUSH BROADCASTS */}
      {subView === 'push' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5 border-line space-y-4">
            <h3 className="text-sm font-bold text-ink-900">Broadcast Push Notification</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-ink-700 mb-1">Target Segment</label>
                <select
                  value={pushSegment}
                  onChange={(e) => setPushSegment(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg bg-page"
                >
                  <option>Active Today</option>
                  <option>Lapsed 3d</option>
                  <option>High Value (VIP)</option>
                  <option>Campus Hub Geofenced</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-700 mb-1">Message Body</label>
                <textarea
                  rows={3}
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg"
                />
              </div>

              <button
                onClick={() => {
                  sendPushNotification(pushTitle, pushBody, pushSegment);
                  toast('Push notification broadcast queued', 'success');
                }}
                className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Broadcast Now</span>
              </button>
            </div>
          </div>

          <div className="card p-5 border-line space-y-3">
            <h3 className="text-sm font-bold text-ink-900">Broadcast Dispatch History</h3>
            <div className="divide-y divide-line text-xs">
              {pushNotifications.map((p) => (
                <div key={p.id} className="py-3 space-y-1">
                  <div className="flex justify-between font-bold text-ink-900">
                    <span>{p.title}</span>
                    <span className="text-[10px] text-leaf-600 font-mono">{p.openRate}% Open</span>
                  </div>
                  <p className="text-ink-500">{p.body}</p>
                  <p className="text-[10px] text-ink-400 font-mono">
                    Segment: {p.targetSegment} · {p.delivered} delivered · {p.sentAt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. FESTIVALS & MASTER HOT/COLD SWITCH */}
      {subView === 'festivals' && (
        <div className="space-y-6">
          {/* Master Switch per Specification in Workflow */}
          <div className="card p-6 bg-brand-50 border-brand-200 flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                Fleet Seasonal Orchestration
              </span>
              <h3 className="text-lg font-bold text-ink-900 mt-1">
                Master Hot / Cold Fleet &amp; App Switch
              </h3>
              <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                Flips eligible vending machines and customer app seasonal UI framing simultaneously. E.g. switch to Frappe Mode for summer heatwaves, or Boiler Mode for monsoon/winter.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleMasterMode('HOT')}
                className="px-4 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition shadow-xs flex items-center gap-1.5"
              >
                <span>🔥 Flip Fleet to HOT (66°C)</span>
              </button>
              <button
                onClick={() => toggleMasterMode('COLD')}
                className="px-4 py-2.5 rounded-xl bg-amber2-500 text-white text-xs font-bold hover:bg-amber2-600 transition shadow-xs flex items-center gap-1.5"
              >
                <span>🧊 Flip Fleet to COLD (6°C)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MACHINE AD SPACES RENTAL */}
      {subView === 'adspaces' && (
        <div className="card overflow-hidden border-line">
          <div className="p-4 border-b border-line bg-page text-xs font-bold text-ink-900">
            Physical Hardware Ad Spaces &amp; Sponsor Invoices
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-page/70 text-[10px] text-ink-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">Slot Surface</th>
                <th className="py-3 px-4">Advertiser</th>
                <th className="py-3 px-4">Monthly Rate</th>
                <th className="py-3 px-4">Renewal Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {adSpaces.map((a) => (
                <tr key={a.id} className="hover:bg-page/50">
                  <td className="py-3 px-4 font-bold text-ink-900">{a.machineName}</td>
                  <td className="py-3 px-4 font-semibold text-ink-700">{a.slotName}</td>
                  <td className="py-3 px-4 text-ink-900">{a.advertiser}</td>
                  <td className="py-3 px-4 font-mono font-bold text-brand-600">
                    ₹{a.rateMonthly}/mo
                  </td>
                  <td className="py-3 px-4 font-mono text-ink-500">{a.renewalDate}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        a.status === 'PAID'
                          ? 'bg-leaf-50 text-leaf-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Coupon Modal */}
      {couponModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-line rounded-2xl p-6 max-w-md w-full shadow-pop">
            <h3 className="text-base font-bold text-ink-900 pb-2 border-b border-line">
              Generate Campaign Coupon
            </h3>
            <form onSubmit={handleCreateCouponSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-ink-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MONSOON25"
                  value={cpnCode}
                  onChange={(e) => setCpnCode(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink-700 mb-1">Discount Amount</label>
                <input
                  type="number"
                  required
                  value={cpnValue}
                  onChange={(e) => setCpnValue(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-line rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink-700 mb-1">Total Budget Cap (₹)</label>
                <input
                  type="number"
                  required
                  value={cpnBudget}
                  onChange={(e) => setCpnBudget(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-line rounded-lg font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 text-ink-500 hover:bg-page rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-xs"
                >
                  Activate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
