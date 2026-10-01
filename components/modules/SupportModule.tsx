'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import { SupportTicket } from '@/lib/types';
import {
  Headset,
  AlertCircle,
  Clock,
  Video,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowUpRight,
  ShieldAlert,
  Send,
  ExternalLink,
  MessageSquare,
  Ban,
} from 'lucide-react';

export default function SupportModule() {
  const {
    tickets,
    selectedTicketId,
    setSelectedTicketId,
    resolveDispute,
    navigateToOrder,
    navigateToCustomer,
    navigateToMachine,
    toast,
  } = useAdmin();

  const [subView, setSubView] = useState<'sla' | 'tickets' | 'refunds' | 'reviews' | 'blacklist' | 'macros'>('tickets');
  const [filterReason, setFilterReason] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Dispute Desk verdict note
  const [verdictNote, setVerdictNote] = useState('');

  const activeTicket =
    tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const filteredTickets = tickets.filter((t) => {
    if (filterReason !== 'ALL' && t.reason !== filterReason) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    return true;
  });

  const openTickets = tickets.filter((t) => t.status === 'OPEN');
  const nearestBreachMinutes = Math.min(...openTickets.map((t) => t.slaRemainingMinutes), 5);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* SLA Alert Strip */}
      <div className="card p-4 bg-amber2-50/70 border-amber2-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-amber2-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            <Clock className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-ink-900">
                5-Minute SLA Guarantee Board
              </h3>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                LIVE COUNTDOWN
              </span>
            </div>
            <p className="text-xs text-ink-600 mt-0.5">
              Oldest unassigned ticket TKT-8902 has{' '}
              <b className="text-rose-700">{nearestBreachMinutes} minutes remaining</b> before SLA breach escalation.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (openTickets.length > 0) {
              setSelectedTicketId(openTickets[0].id);
              setSubView('tickets');
              toast(`Claimed highest priority ticket ${openTickets[0].id}`, 'info');
            }
          }}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
        >
          Claim Next Priority Ticket
        </button>
      </div>

      {/* Sub Navigation */}
      <div className="flex border-b border-line text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setSubView('tickets')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subView === 'tickets'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Dispute Desk &amp; Queue ({tickets.length})
        </button>
        <button
          onClick={() => setSubView('refunds')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subView === 'refunds'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Refunds Approval Queue
        </button>
        <button
          onClick={() => setSubView('reviews')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subView === 'reviews'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Customer Reviews &amp; Ratings
        </button>
        <button
          onClick={() => setSubView('blacklist')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subView === 'blacklist'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Fraud Blacklist
        </button>
        <button
          onClick={() => setSubView('macros')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subView === 'macros'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Bot Reply Macros
        </button>
      </div>

      {/* 1. DISPUTE DESK & QUEUE */}
      {subView === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Tickets Queue List (4 cols) */}
          <div className="lg:col-span-4 card overflow-hidden border-line">
            <div className="p-3 bg-page border-b border-line flex items-center justify-between text-xs font-bold text-ink-900">
              <span>Support Claims Queue</span>
              <span className="text-ink-400 font-mono">{filteredTickets.length} cases</span>
            </div>

            <div className="divide-y divide-line max-h-[680px] overflow-y-auto">
              {filteredTickets.map((t) => {
                const isSelected = t.id === activeTicket?.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 cursor-pointer transition ${
                      isSelected
                        ? 'bg-brand-50/70 border-l-4 border-l-brand-500'
                        : 'hover:bg-page/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-mono font-bold text-xs text-ink-900">
                        {t.ticketNo}
                      </span>
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                          t.status === 'OPEN'
                            ? 'bg-rose-50 text-rose-700'
                            : t.status === 'RESOLVED_REFUND'
                            ? 'bg-leaf-50 text-leaf-700'
                            : 'bg-ink-100 text-ink-600'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-ink-900 mt-1 line-clamp-1">
                      {t.reasonLabel}
                    </p>
                    <p className="text-[11px] text-ink-500 line-clamp-1 mt-0.5">
                      {t.customerName} · {t.machineName}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10.5px]">
                      <span className="font-mono text-ink-400">{t.claimedAt}</span>
                      <span className="font-bold text-brand-600 font-mono">₹{t.amount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: The Dispute Desk (8 cols) - Side-by-side Evidence Desk */}
          {activeTicket && (
            <div className="lg:col-span-8 card p-5 border-line space-y-5 bg-white">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-600 uppercase font-mono tracking-wider">
                      Dispute Investigation Desk
                    </span>
                    <span className="text-ink-400">·</span>
                    <span className="font-mono text-xs text-ink-500">{activeTicket.ticketNo}</span>
                  </div>
                  <h2 className="text-lg font-bold text-ink-900 mt-0.5">
                    {activeTicket.reasonLabel}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink-500 font-mono">
                    Channel: {activeTicket.channel}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-md ${
                      activeTicket.status === 'OPEN'
                        ? 'bg-rose-50 text-rose-700'
                        : activeTicket.status === 'RESOLVED_REFUND'
                        ? 'bg-leaf-50 text-leaf-700'
                        : 'bg-ink-100 text-ink-700'
                    }`}
                  >
                    {activeTicket.status}
                  </span>
                </div>
              </div>

              {/* Side-by-Side Dual Panes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Pane: Customer Claim & Auto-Context */}
                <div className="space-y-4">
                  <div className="card p-3.5 bg-page/50 border-line space-y-2 text-xs">
                    <p className="font-bold text-ink-900 border-b border-line pb-1">
                      Customer Claim Statement
                    </p>
                    <p className="text-ink-700 leading-relaxed italic">
                      &ldquo;{activeTicket.customerMessage}&rdquo;
                    </p>
                    <div className="pt-2 text-[11px] text-ink-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <button
                          onClick={() => navigateToCustomer(activeTicket.customerId)}
                          className="font-bold text-brand-600 hover:underline flex items-center gap-1"
                        >
                          <span>{activeTicket.customerName}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span>Associated Order:</span>
                        <button
                          onClick={() => navigateToOrder(activeTicket.orderId)}
                          className="font-mono font-bold text-brand-600 hover:underline flex items-center gap-1"
                        >
                          <span>{activeTicket.orderNo}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span>Vending Machine:</span>
                        <button
                          onClick={() => navigateToMachine(activeTicket.machineId)}
                          className="font-bold text-ink-700 hover:underline flex items-center gap-1"
                        >
                          <span>{activeTicket.machineName}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span>Claimed UTR:</span>
                        <span className="truncate max-w-[150px]">{activeTicket.utr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Auto-Context Window: What else happened ±10m around order */}
                  <div className="card p-3.5 border-line space-y-2 text-xs">
                    <p className="font-bold text-ink-900">
                      Machine Environment Context (±10m Window)
                    </p>
                    <div className="space-y-1 text-ink-600 text-[11.5px]">
                      <p>✓ Boiler temp stable at 65.4°C throughout pour</p>
                      <p>⚠️ Chute optical sensor registered irregular 2.1s obstruction</p>
                      <p>✓ 4 orders before and 6 orders after completed nominal</p>
                    </div>
                  </div>
                </div>

                {/* Right Pane: Video Clip + Synchronized Dispense Sensor Log */}
                <div className="space-y-4">
                  {/* Camera Clip */}
                  <div className="card overflow-hidden border-line">
                    <div className="p-2.5 bg-page border-b border-line flex items-center justify-between text-xs">
                      <span className="font-bold text-ink-900 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-brand-500" />
                        <span>Synchronized 30s Evidence Clip</span>
                      </span>
                      <span className="text-[10px] text-ink-400 font-mono">CH-01 &amp; CH-02</span>
                    </div>

                    <div className="h-44 bg-slate-900 relative flex items-center justify-center text-white">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between font-mono text-[9px] text-emerald-400">
                        <div className="flex justify-between">
                          <span>SYNCED TIMESTAMP: 11:42:15</span>
                          <span>SPEED: 1.0X</span>
                        </div>
                        <div className="flex justify-between text-white/90">
                          <span>CUP TILT DETECTED: YES (14°)</span>
                          <span>POUR INTERRUPTED</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center mx-auto mb-1 text-white shadow-xs">
                          ▶
                        </div>
                        <p className="text-[11px] text-slate-300">Play Synchronized Stream</p>
                      </div>
                    </div>
                  </div>

                  {/* Sensor Log with Variance Warning */}
                  <div className="card p-3.5 border-line space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-ink-900">Sensor Telemetry Telemetric Log</p>
                      {activeTicket.dispenseVariance > 15 ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          ⚠️ Variance {activeTicket.dispenseVariance}% (Fault Flagged)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-leaf-700 bg-leaf-50 px-2 py-0.5 rounded">
                          Nominal
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] space-y-1 text-ink-600 bg-page/70 p-2.5 rounded-lg">
                      <div className="flex justify-between">
                        <span>Expected Flow Volume:</span>
                        <span>180 ml</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Actual Measured Dispense:</span>
                        <span className="font-bold text-rose-600">147 ml (Cut short)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valve Open Time:</span>
                        <span>2,100 ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recommendation:</span>
                        <span className="font-bold text-brand-600">Legitimate Claim (Approve)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verdict Bar (Action Matrix) */}
              <div className="pt-3 border-t border-line space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter audit verdict note or proof explanation..."
                    value={verdictNote}
                    onChange={(e) => setVerdictNote(e.target.value)}
                    className="flex-1 px-3 py-2 border border-line rounded-lg text-xs outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => resolveDispute(activeTicket.id, 'APPROVE_REFUND', verdictNote)}
                    className="flex-1 py-2 px-3 bg-leaf-600 hover:bg-leaf-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Refund (₹{activeTicket.amount})</span>
                  </button>

                  <button
                    onClick={() => resolveDispute(activeTicket.id, 'REJECT', verdictNote)}
                    className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject with Proof Link</span>
                  </button>

                  <button
                    onClick={() => resolveDispute(activeTicket.id, 'REQUEST_INFO', verdictNote)}
                    className="py-2 px-3 border border-line hover:bg-page text-ink-700 text-xs font-semibold rounded-lg"
                  >
                    Request Info
                  </button>

                  <button
                    onClick={() => resolveDispute(activeTicket.id, 'BLACKLIST', verdictNote)}
                    className="py-2 px-3 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg flex items-center gap-1"
                    title="Add fraudster to blacklist"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Blacklist</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. REFUNDS QUEUE */}
      {subView === 'refunds' && (
        <div className="card overflow-hidden border-line">
          <div className="p-4 border-b border-line bg-page text-xs font-bold text-ink-900">
            Pending Financial Payout Approvals
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-page/70 text-[10px] text-ink-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr className="hover:bg-page/50">
                <td className="py-3 px-4 font-mono font-bold text-brand-600">TKT-8902</td>
                <td className="py-3 px-4 font-semibold text-ink-900">Aman Sharma</td>
                <td className="py-3 px-4 font-mono font-bold">₹50.00</td>
                <td className="py-3 px-4 font-mono text-ink-600">UPI / GPay</td>
                <td className="py-3 px-4 text-ink-500">Cup stuck &amp; variance 18.3%</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => resolveDispute('TKT-8902', 'APPROVE_REFUND', 'Approved from refund queue')}
                    className="px-3 py-1 bg-leaf-600 text-white rounded font-semibold text-xs shadow-xs"
                  >
                    Authorize Payout
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 3. REVIEWS & RATINGS */}
      {subView === 'reviews' && (
        <div className="card p-5 border-line space-y-4">
          <h3 className="text-sm font-bold text-ink-900">Customer Feedback &amp; Cup Ratings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-page rounded-xl">
              <p className="text-xs text-ink-500">Average Network Rating</p>
              <p className="text-3xl font-bold text-brand-600 mt-1">4.82 ★</p>
              <p className="text-xs text-ink-400 mt-1">Based on 1,420 ratings</p>
            </div>
            <div className="p-4 bg-page rounded-xl">
              <p className="text-xs text-ink-500">Temperature Satisfaction</p>
              <p className="text-3xl font-bold text-leaf-600 mt-1">98.4%</p>
              <p className="text-xs text-ink-400 mt-1">Consistent 65.4°C boiler</p>
            </div>
            <div className="p-4 bg-page rounded-xl">
              <p className="text-xs text-ink-500">Top Rated Variant</p>
              <p className="text-xl font-bold text-ink-900 mt-1">Manhattan Velvet</p>
              <p className="text-xs text-brand-600 mt-1">4.94 ★ (620 reviews)</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. BLACKLIST */}
      {subView === 'blacklist' && (
        <div className="card overflow-hidden border-line">
          <div className="p-4 border-b border-line bg-page text-xs font-bold text-ink-900">
            Permanent Fraud Blacklist
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-page/70 text-[10px] text-ink-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Identifier</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Blacklisted Reason</th>
                <th className="py-3 px-4">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono">
              <tr className="hover:bg-page/50">
                <td className="py-3 px-4 font-bold text-rose-600">+91 99201 00021</td>
                <td className="py-3 px-4">PHONE NUMBER</td>
                <td className="py-3 px-4 text-rose-700 font-bold">CRITICAL</td>
                <td className="py-3 px-4 font-sans text-ink-700">Fabricated UTR screen edit attacks</td>
                <td className="py-3 px-4 text-ink-400">PERMANENT</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 5. BOT MACROS */}
      {subView === 'macros' && (
        <div className="space-y-4">
          <div className="card p-4 border-line space-y-3">
            <h3 className="text-sm font-bold text-ink-900">Automated Bot Reply Macros</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-page rounded-lg border border-line">
                <p className="font-bold text-brand-600 mb-1">Macro #1: Cup Stuck Dispense Verification</p>
                <p className="text-ink-700 font-mono text-[11.5px]">
                  &ldquo;Hi {'{customer_name}'}, we checked machine {'{machine_name}'} camera and sensor telemetry for your order {'{order_no}'}. A refund of ₹{'{amount}'} has been initiated to your UPI source. Reference: {'{refund_id}'}.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
