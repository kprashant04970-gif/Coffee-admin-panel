'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import { Customer } from '@/lib/types';
import {
  Users,
  Search,
  Wallet,
  Coins,
  Flame,
  Award,
  ShieldCheck,
  Send,
  Plus,
  Ban,
  CheckCircle,
  ExternalLink,
  QrCode,
  History,
} from 'lucide-react';

export default function CustomersModule() {
  const {
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    creditWallet,
    toggleBlockCustomer,
    sendPushNotification,
    navigateToOrder,
    orders,
    toast,
  } = useAdmin();

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSegment, setCustomerSegment] = useState<string>('ALL');

  // Active customer tab in profile view: 'profile' | 'wallet' | 'codes'
  const [profileTab, setProfileTab] = useState<'profile' | 'wallet' | 'codes'>('profile');

  // Modals
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState(50);
  const [creditNote, setCreditNote] = useState('Loyalty compensation');

  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [pushTitle, setPushTitle] = useState('☕ Exclusive brew waiting for you!');
  const [pushBody, setPushBody] = useState('Enjoy ₹15 off on your next cup at Campus Hub.');

  const activeCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const filteredCustomers = customers.filter((c) => {
    if (customerSegment !== 'ALL' && c.segment !== customerSegment) return false;
    if (
      customerSearch.trim() &&
      !c.name.toLowerCase().includes(customerSearch.toLowerCase()) &&
      !c.phone.includes(customerSearch)
    ) {
      return false;
    }
    return true;
  });

  const customerOrders = orders.filter((o) => o.buyerId === activeCustomer.id);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-ink-900">
            Customer 360° Directory &amp; Wallet Ledgers
          </h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            Profiles, consent records, consumption heatmaps, and float accounting.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-lg px-3 py-1.5 text-xs text-brand-700">
          <span className="font-semibold">Honest Attribution:</span>
          <span>~18% of cup redemptions are anonymous shared QR codes</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-line rounded-lg text-xs w-48 sm:w-60 outline-none focus:border-brand-500 bg-page"
            />
          </div>

          <select
            value={customerSegment}
            onChange={(e) => setCustomerSegment(e.target.value)}
            className="px-2.5 py-1.5 border border-line rounded-lg bg-page text-ink-700 text-xs"
          >
            <option value="ALL">All Segments</option>
            <option value="High Value">High Value (VIP)</option>
            <option value="Active Today">Active Today</option>
            <option value="Active This Week">Active This Week</option>
            <option value="Lapsed 7d">Lapsed (7+ days)</option>
          </select>
        </div>

        <span className="text-xs text-ink-400 font-mono">
          {filteredCustomers.length} registered profiles
        </span>
      </div>

      {/* Main Grid: List + 360° Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="card overflow-hidden border-line lg:col-span-1">
          <div className="p-3 bg-page border-b border-line text-xs font-bold text-ink-700">
            Registered Customers
          </div>
          <div className="divide-y divide-line max-h-[600px] overflow-y-auto">
            {filteredCustomers.map((c) => {
              const isSelected = c.id === activeCustomer.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${
                    isSelected ? 'bg-brand-50/70 border-l-4 border-l-brand-500' : 'hover:bg-page/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                    {c.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-ink-900 truncate">{c.name}</p>
                      <span className="text-[10px] font-bold text-leaf-600 bg-leaf-50 px-1.5 py-0.5 rounded">
                        {c.streak}🔥 streak
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-500 font-mono">{c.phone}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-ink-400">
                      <span>{c.ordersCount} orders</span>
                      <span>·</span>
                      <span className="font-semibold text-ink-700">₹{c.totalSpend} LTV</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 360° Profile View (2 cols) */}
        <div className="card overflow-hidden border-line lg:col-span-2 bg-white">
          {/* Profile Header */}
          <div className="p-5 border-b border-line bg-page/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white font-bold text-xl flex items-center justify-center shadow-xs">
                {activeCustomer.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-ink-900 leading-tight">
                    {activeCustomer.name}
                  </h2>
                  <span className="text-[10px] font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md">
                    {activeCustomer.segment}
                  </span>
                  {activeCustomer.isBlocked && (
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md">
                      BLOCKED
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-500 font-mono mt-0.5">
                  {activeCustomer.phone} · {activeCustomer.collegeOrWork} · {activeCustomer.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCreditModalOpen(true)}
                className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Credit Wallet</span>
              </button>
              <button
                onClick={() => setPushModalOpen(true)}
                className="px-3 py-1.5 border border-line bg-white hover:bg-page text-ink-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-brand-500" />
                <span>Send Push</span>
              </button>
              <button
                onClick={() => toggleBlockCustomer(activeCustomer.id)}
                className={`p-1.5 rounded-lg border text-xs ${
                  activeCustomer.isBlocked
                    ? 'border-rose-300 bg-rose-50 text-rose-700'
                    : 'border-line hover:bg-page text-ink-500'
                }`}
                title={activeCustomer.isBlocked ? 'Unblock customer' : 'Block customer'}
              >
                <Ban className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex border-b border-line px-5 bg-white text-xs">
            <button
              onClick={() => setProfileTab('profile')}
              className={`py-3 px-3 font-semibold border-b-2 transition ${
                profileTab === 'profile'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-ink-500 hover:text-ink-900'
              }`}
            >
              360° Profile &amp; Heatmap
            </button>
            <button
              onClick={() => setProfileTab('wallet')}
              className={`py-3 px-3 font-semibold border-b-2 transition ${
                profileTab === 'wallet'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-ink-500 hover:text-ink-900'
              }`}
            >
              Wallet &amp; Float Ledger
            </button>
            <button
              onClick={() => setProfileTab('codes')}
              className={`py-3 px-3 font-semibold border-b-2 transition ${
                profileTab === 'codes'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-ink-500 hover:text-ink-900'
              }`}
            >
              Issued QR Codes History
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 space-y-6">
            {profileTab === 'profile' && (
              <>
                {/* 4 Stat Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="card p-3 bg-page/40 border-line">
                    <p className="text-[11px] text-ink-400">Float Balance</p>
                    <p className="text-xl font-bold font-mono text-ink-900 mt-0.5">
                      ₹{activeCustomer.walletBalance}
                    </p>
                  </div>
                  <div className="card p-3 bg-page/40 border-line">
                    <p className="text-[11px] text-ink-400">Ad Coins</p>
                    <p className="text-xl font-bold font-mono text-amber2-600 mt-0.5">
                      {activeCustomer.coins}
                    </p>
                  </div>
                  <div className="card p-3 bg-page/40 border-line">
                    <p className="text-[11px] text-ink-400">Active Streak</p>
                    <p className="text-xl font-bold font-mono text-leaf-600 mt-0.5">
                      {activeCustomer.streak} days
                    </p>
                  </div>
                  <div className="card p-3 bg-page/40 border-line">
                    <p className="text-[11px] text-ink-400">Lifetime Spend</p>
                    <p className="text-xl font-bold font-mono text-ink-900 mt-0.5">
                      ₹{activeCustomer.totalSpend}
                    </p>
                  </div>
                </div>

                {/* Consumption Heatmap */}
                <div className="card p-4 border-line">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-ink-900">
                      Hourly Consumption Patterns (Last 30 Days)
                    </h4>
                    <span className="text-[11px] text-ink-400">
                      Favorite: {activeCustomer.favoriteVariant}
                    </span>
                  </div>
                  <div className="grid grid-cols-12 gap-1.5 text-center">
                    {Array.from({ length: 12 }).map((_, idx) => {
                      const hour = idx * 2;
                      const intensity = idx === 5 || idx === 6 ? 90 : idx === 4 ? 60 : idx === 7 ? 40 : 15;
                      return (
                        <div key={idx} className="space-y-1">
                          <div
                            className="h-10 rounded-sm transition hover:opacity-80"
                            style={{
                              background:
                                intensity > 70
                                  ? '#F04E23'
                                  : intensity > 50
                                  ? '#F97C4A'
                                  : intensity > 30
                                  ? '#FFA47C'
                                  : '#FFE6DA',
                            }}
                          />
                          <span className="text-[9px] text-ink-400 font-mono">
                            {hour}h
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Privacy & Opt-in Record */}
                <div className="card p-4 border-line space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-ink-900 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-leaf-600" />
                    <span>Privacy &amp; Social Leaderboard Consent</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-ink-600">
                    <div className="flex justify-between border-b border-line pb-1">
                      <span>Public Leaderboard Handle:</span>
                      <span className="font-semibold text-leaf-700">
                        {activeCustomer.leaderboardOptIn ? 'Opted-In (Verified)' : 'Masked'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-line pb-1">
                      <span>Consent Signed:</span>
                      <span className="font-mono text-ink-400">v2.1 Terms / 12 Aug 2026</span>
                    </div>
                  </div>
                </div>

                {/* Order History */}
                <div>
                  <h4 className="text-xs font-bold text-ink-900 mb-2">
                    Recent Coffee Orders ({customerOrders.length})
                  </h4>
                  <div className="card overflow-hidden border-line text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-page text-[10px] text-ink-400 uppercase font-semibold">
                        <tr>
                          <th className="py-2 px-3">Order</th>
                          <th className="py-2 px-3">Time</th>
                          <th className="py-2 px-3">Variant</th>
                          <th className="py-2 px-3">Amount</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {customerOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-page/50">
                            <td className="py-2 px-3 font-mono font-bold">{o.orderNo}</td>
                            <td className="py-2 px-3 text-ink-500 font-mono">{o.time}</td>
                            <td className="py-2 px-3 font-semibold">{o.variant}</td>
                            <td className="py-2 px-3 font-mono font-bold">₹{o.netAmount}</td>
                            <td className="py-2 px-3 text-leaf-600 font-bold">{o.status}</td>
                            <td className="py-2 px-3 text-right">
                              <button
                                onClick={() => navigateToOrder(o.id)}
                                className="text-brand-500 hover:underline font-semibold"
                              >
                                View Evidence →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Wallet Ledger Tab */}
            {profileTab === 'wallet' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-ink-900">
                    Prepaid Balance Ledger (Running Balance)
                  </p>
                  <span className="font-mono font-bold text-brand-600 text-sm">
                    Current Float: ₹{activeCustomer.walletBalance}.00
                  </span>
                </div>

                <div className="card overflow-hidden border-line">
                  <table className="w-full text-left">
                    <thead className="bg-page text-[10px] text-ink-400 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">Transaction ID</th>
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4">Amount</th>
                        <th className="py-2.5 px-4">Balance After</th>
                        <th className="py-2.5 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line font-mono">
                      <tr className="hover:bg-page/50">
                        <td className="py-3 px-4 font-bold text-ink-900">TXN-882109</td>
                        <td className="py-3 px-4 text-leaf-600 font-bold">CREDIT</td>
                        <td className="py-3 px-4 text-leaf-600">+₹200.00</td>
                        <td className="py-3 px-4 text-ink-900 font-bold">₹240.00</td>
                        <td className="py-3 px-4 font-sans text-ink-600">
                          UPI Auto-Topup via Razorpay (GPay)
                        </td>
                      </tr>
                      <tr className="hover:bg-page/50">
                        <td className="py-3 px-4 font-bold text-ink-900">TXN-881944</td>
                        <td className="py-3 px-4 text-rose-600 font-bold">DEBIT</td>
                        <td className="py-3 px-4 text-rose-600">-₹50.00</td>
                        <td className="py-3 px-4 text-ink-900 font-bold">₹40.00</td>
                        <td className="py-3 px-4 font-sans text-ink-600">
                          Order #ORD-9842 Manhattan Velvet
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Issued QR Codes History */}
            {profileTab === 'codes' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-ink-900">Cryptographic QR Tokens Generated</p>
                  <span className="text-ink-400 text-xs">Signed with HMAC-SHA256</span>
                </div>

                <div className="space-y-3">
                  <div className="card p-3.5 border-line flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-ink-900 font-mono">QR-MH-98420-VELVET</p>
                        <p className="text-[11px] text-ink-500 mt-0.5">
                          Source: Purchase · Shared: 0 times · Redeemed at Campus Hub
                        </p>
                      </div>
                    </div>
                    <span className="text-leaf-600 font-bold bg-leaf-50 px-2 py-0.5 rounded text-[10px]">
                      REDEEMED
                    </span>
                  </div>

                  <div className="card p-3.5 border-line flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber2-50 text-amber2-600 flex items-center justify-center">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-ink-900 font-mono">QR-MH-97412-GIFT</p>
                        <p className="text-[11px] text-ink-500 mt-0.5">
                          Source: Gift to +91 97112 ••••• · Shared: 1 time · Expires in 48h
                        </p>
                      </div>
                    </div>
                    <span className="text-amber2-700 font-bold bg-amber2-50 px-2 py-0.5 rounded text-[10px]">
                      UNREDEEMED
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Credit Wallet Modal */}
      {creditModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-line rounded-2xl p-6 max-w-md w-full shadow-pop">
            <h3 className="text-base font-bold text-ink-900 pb-2 border-b border-line">
              Manual Wallet Float Credit: {activeCustomer.name}
            </h3>
            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink-700 mb-1">
                  Credit Amount (₹)
                </label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-line rounded-lg font-mono text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink-700 mb-1">
                  Audit Reason / Ledger Note
                </label>
                <input
                  type="text"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setCreditModalOpen(false)}
                  className="px-4 py-2 text-ink-500 hover:bg-page rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    creditWallet(activeCustomer.id, creditAmount, creditNote);
                    setCreditModalOpen(false);
                  }}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-xs"
                >
                  Post Credit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Push Modal */}
      {pushModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-line rounded-2xl p-6 max-w-md w-full shadow-pop">
            <h3 className="text-base font-bold text-ink-900 pb-2 border-b border-line">
              Transmit Direct Push Notification
            </h3>
            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink-700 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink-700 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={3}
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setPushModalOpen(false)}
                  className="px-4 py-2 text-ink-500 hover:bg-page rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    sendPushNotification(pushTitle, pushBody, activeCustomer.segment);
                    setPushModalOpen(false);
                  }}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-xs"
                >
                  Transmit Push
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
