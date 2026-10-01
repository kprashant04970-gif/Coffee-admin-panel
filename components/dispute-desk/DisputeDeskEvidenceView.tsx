'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast as sonnerToast } from 'sonner';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowUpRight,
  ShieldAlert,
  Play,
  Pause,
  Video,
  Activity,
  Clock,
  User,
  Coffee,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Calendar,
  AlertOctagon,
  ChevronRight,
} from 'lucide-react';

export interface EvidenceData {
  ticketId: string;
  ticketNo: string;
  orderNo: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerSpend: number;
  customerStreak: number;
  loyaltyTier: string;
  machineId: string;
  machineName: string;
  machineLocation: string;
  customerMessage: string;
  reason: string;
  reasonLabel: string;
  slaRemainingMinutes: number;
  slaDeadline: string;
  minuteContext: Array<{ time: string; event: string; severity: 'info' | 'warn' | 'error' }>;
  recentOrders: Array<{ id: string; variant: string; time: string; amount: number; status: string }>;
  camera: {
    channel: string;
    label: string;
    durationSecs: number;
    clipTimestamp: string;
    videoUrl: string;
  };
  sensorLog: {
    valveOpenMs: number;
    flowPulses: number;
    expectedMl: number;
    dispensedMl: number;
    variancePct: number;
    cupDetected: boolean;
    kitDropped: boolean;
    windowOpened: boolean;
    pickupDetected: boolean;
  };
  healthTimeline: Array<{
    relativeMins: string;
    event: string;
    status: 'NORMAL' | 'WARN' | 'FAULT';
    color: string;
  }>;
}

export const MOCK_EVIDENCE_BUNDLE: EvidenceData = {
  ticketId: 'TCK-8921',
  ticketNo: '#TCK-8921',
  orderNo: '#ORD-9021',
  amount: 45.0,
  customerName: 'Aarav Mehta',
  customerPhone: '+91 98201 44921',
  customerSpend: 1420,
  customerStreak: 8,
  loyaltyTier: 'Gold Patron',
  machineId: 'MCH-001',
  machineName: 'MCH-001 Campus Hub',
  machineLocation: 'North Campus Quad B, Mumbai',
  customerMessage:
    'Ordered Manhattan Velvet Cappuccino. The machine made a buzzing sound for 10 seconds, but only dispensed half a cup of foamy milk with barely any espresso. Money was deducted via UPI.',
  reason: 'UNDER_FILLED',
  reasonLabel: 'Partial Dispense / Cup Half Empty',
  slaRemainingMinutes: 4,
  slaDeadline: '14:27:00 (5m SLA Window)',
  minuteContext: [
    { time: '14:21:40', event: 'Espresso solenoid valve actuation command sent', severity: 'info' },
    { time: '14:21:48', event: 'Flow sensor pulse rate dropped below 20 Hz threshold', severity: 'warn' },
    { time: '14:22:04', event: 'Order #ORD-9021 dispense completed (112ml dispensed)', severity: 'error' },
    { time: '14:22:18', event: 'Temperature recovery cycle initiated', severity: 'info' },
  ],
  recentOrders: [
    { id: '#ORD-9021', variant: 'Manhattan Velvet Cappuccino', time: '14:22:04', amount: 45, status: 'Disputed' },
    { id: '#ORD-8840', variant: 'Classic Latte', time: 'Yesterday', amount: 40, status: 'Completed' },
    { id: '#ORD-8612', variant: 'Dark Roast Espresso', time: '29 Sep', amount: 35, status: 'Completed' },
    { id: '#ORD-8401', variant: 'Manhattan Velvet Cappuccino', time: '28 Sep', amount: 45, status: 'Completed' },
    { id: '#ORD-8210', variant: 'Cold Frappe Malai', time: '27 Sep', amount: 50, status: 'Completed' },
  ],
  camera: {
    channel: 'CH-01',
    label: 'Internal Chute Optical Stream',
    durationSecs: 30,
    clipTimestamp: '14:21:50 — 14:22:20 IST',
    videoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
  },
  sensorLog: {
    valveOpenMs: 12420,
    flowPulses: 432,
    expectedMl: 180,
    dispensedMl: 112,
    variancePct: -37.7,
    cupDetected: true,
    kitDropped: true,
    windowOpened: true,
    pickupDetected: true,
  },
  healthTimeline: [
    { relativeMins: '-10m', event: 'Boiler 65.4°C normal', status: 'NORMAL', color: '#10B981' },
    { relativeMins: '-6m', event: 'Chute optical trigger test passed', status: 'NORMAL', color: '#10B981' },
    { relativeMins: '-2m', event: 'Pressure drop (0.4 bar below baseline)', status: 'WARN', color: '#F59E0B' },
    { relativeMins: '0m', event: 'Dispense Order #ORD-9021 (Valve open 12.4s)', status: 'FAULT', color: '#EF4444' },
    { relativeMins: '+3m', event: 'Boiler temperature recovery', status: 'NORMAL', color: '#10B981' },
    { relativeMins: '+8m', event: 'Subsequent dispense completed', status: 'NORMAL', color: '#10B981' },
  ],
};

export default function DisputeDeskEvidenceView({ data = MOCK_EVIDENCE_BUNDLE }: { data?: EvidenceData }) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCam, setActiveCam] = useState<'CH-01' | 'CH-02'>('CH-01');
  const [refundDestination, setRefundDestination] = useState<'UPI' | 'WALLET'>('UPI');
  const [verdictResolved, setVerdictResolved] = useState<string | null>(null);

  const isHighVariance = Math.abs(data.sensorLog.variancePct) > 15;

  const handleApproveRefund = () => {
    setVerdictResolved('APPROVED');
    sonnerToast.success(
      `Dispute Approved: ₹${data.amount} refund dispatched via ${refundDestination} to ${data.customerName}`
    );
  };

  const handleRejectWithProof = () => {
    setVerdictResolved('REJECTED');
    sonnerToast.error(
      `Dispute Rejected: Optical & flow sensor proof packaged into customer SMS receipt.`
    );
  };

  const handleEscalate = () => {
    sonnerToast.warning(`Ticket ${data.ticketNo} escalated to Senior Operations Supervisor.`);
  };

  const handleBlacklist = () => {
    sonnerToast.error(`Customer ${data.customerPhone} marked in Fraud Blacklist.`);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-line shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/support"
            className="p-2 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-ink-900 font-mono">
                {data.ticketNo}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {data.reasonLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-50 text-brand-700 border border-brand-200">
                {data.orderNo}
              </span>
            </div>
            <p className="text-xs text-ink-500 mt-0.5">
              Hydrated via atomic RPC <code className="text-brand-600 font-mono">fn_ticket_evidence_bundle</code>
            </p>
          </div>
        </div>

        {/* SLA Guarantee Countdown */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block">
              SLA Deadline (5m Guarantee)
            </span>
            <span className="text-sm font-bold font-mono text-rose-600 flex items-center justify-end gap-1">
              <Clock className="w-4 h-4 text-rose-600 animate-pulse" />
              {data.slaRemainingMinutes}m Remaining
            </span>
          </div>

          <div className="text-right pl-4 border-l border-line">
            <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block">
              Disputed Amount
            </span>
            <span className="text-lg font-bold font-mono text-ink-900">
              ₹{data.amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* VERDICT HINT BANNER (if variance > 15%) */}
      {isHighVariance && (
        <div className="bg-amber-500/10 border-2 border-amber-400 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
              <span>Automatic Recommendation: Approve Full Refund</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[11px] font-mono font-bold">
                {data.sensorLog.variancePct}% Variance Detected
              </span>
            </h4>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed">
              Ground-truth flow meter measured only <strong>{data.sensorLog.dispensedMl} ml</strong> out of expected <strong>{data.sensorLog.expectedMl} ml</strong>. Under-fill threshold violated (&gt;15%). Machine pressure dropped 2 minutes prior. Customer has 8 consecutive purchase streak with 0 past disputes.
            </p>
          </div>
        </div>
      )}

      {/* SPLIT-PANE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE (5 Cols): Customer Claim & Auto-Context */}
        <div className="lg:col-span-5 space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="font-bold text-sm text-ink-900 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" />
                <span>Customer Profile</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {data.loyaltyTier}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-ink-400 block text-[11px]">Full Name</span>
                <span className="font-bold text-ink-900 text-[13px]">{data.customerName}</span>
              </div>
              <div>
                <span className="text-ink-400 block text-[11px]">Phone</span>
                <span className="font-mono text-ink-800">{data.customerPhone}</span>
              </div>
              <div>
                <span className="text-ink-400 block text-[11px]">Lifetime Spend</span>
                <span className="font-mono font-bold text-ink-900 text-[13px]">
                  ₹{data.customerSpend}
                </span>
              </div>
              <div>
                <span className="text-ink-400 block text-[11px]">Order Streak</span>
                <span className="font-mono font-bold text-emerald-600">
                  🔥 {data.customerStreak} Days
                </span>
              </div>
            </div>
          </div>

          {/* Customer Claim & Message */}
          <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-ink-900 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-brand-600" />
              <span>Customer Claim Details</span>
            </h3>

            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 text-xs text-amber-950 leading-relaxed font-sans italic">
              &ldquo;{data.customerMessage}&rdquo;
            </div>

            <div className="text-xs space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-ink-500">Claimed Machine:</span>
                <span className="font-medium text-ink-900">{data.machineName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500">Location:</span>
                <span className="text-ink-700 truncate max-w-[200px]">{data.machineLocation}</span>
              </div>
            </div>
          </div>

          {/* "What Else Happened That Minute" Log */}
          <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-ink-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <span>What Happened That Minute (14:21 - 14:23)</span>
            </h3>

            <div className="space-y-2 text-xs">
              {data.minuteContext.map((c, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                    c.severity === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : c.severity === 'warn'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-ink-50 border-ink-200 text-ink-800'
                  }`}
                >
                  <span className="font-mono text-[10.5px] font-bold shrink-0">{c.time}</span>
                  <span className="flex-1 leading-snug">{c.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Last 5 Orders Context */}
          <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-ink-900 flex items-center justify-between">
              <span>Customer Order History</span>
              <span className="text-xs text-ink-400 font-mono">Last 5 Orders</span>
            </h3>

            <div className="divide-y divide-line text-xs">
              {data.recentOrders.map((o) => (
                <div key={o.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-ink-900">{o.id}</span>
                    <p className="text-[11px] text-ink-600 truncate max-w-[170px]">{o.variant}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-ink-900">₹{o.amount}</span>
                    <span
                      className={`block text-[10px] font-semibold ${
                        o.status === 'Disputed' ? 'text-amber-600 font-bold' : 'text-emerald-600'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANE (7 Cols): The Evidence Bundle */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. CCTV Video Evidence Player Placeholder */}
          <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-sm text-ink-900">
                  Synchronized Dispense Surveillance (30s Window)
                </h3>
              </div>
              <div className="flex items-center gap-1.5 bg-ink-100 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setActiveCam('CH-01')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    activeCam === 'CH-01' ? 'bg-brand-500 text-white shadow-xs' : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  CH-01 Chute
                </button>
                <button
                  onClick={() => setActiveCam('CH-02')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    activeCam === 'CH-02' ? 'bg-brand-500 text-white shadow-xs' : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  CH-02 Pickup Window
                </button>
              </div>
            </div>

            {/* Video Player Mock */}
            <div className="relative aspect-video rounded-xl bg-ink-950 overflow-hidden border border-ink-800 flex items-center justify-center group shadow-inner">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 filter contrast-125"
                style={{ backgroundImage: `url(${data.camera.videoUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

              {/* Watermark OSD */}
              <div className="absolute top-3 left-3 text-[11px] font-mono text-emerald-400 bg-black/70 px-2.5 py-1 rounded border border-emerald-500/40">
                ● REC | {data.machineId} | {activeCam} | {data.camera.clipTimestamp}
              </div>

              {/* Center Play Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="relative z-10 w-14 h-14 rounded-full bg-brand-500/90 text-white flex items-center justify-center hover:scale-105 transition shadow-2xl cursor-pointer"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>

              {/* Bottom Scrubber Bar */}
              <div className="absolute bottom-3 inset-x-3 text-xs text-white flex items-center gap-3">
                <span className="font-mono text-[11px]">00:14 / 00:30</span>
                <div className="flex-1 bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full w-[46%]" />
                </div>
                <span className="text-[10px] text-ink-300 font-mono uppercase bg-black/60 px-2 py-0.5 rounded">
                  H.265 1080p
                </span>
              </div>
            </div>
            <p className="text-[11px] text-ink-500 text-center">
              Internal chute footage automatically preserved for 30 days under FSSAI Dispute Desk mandate.
            </p>
          </div>

          {/* 2. Sensor Log Table (Flow pulses, ms, dispensed vs expected, variance %) */}
          <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <h3 className="font-bold text-sm text-ink-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-600" />
                <span>Ground-Truth Sensor Dispense Telemetry</span>
              </h3>
              <span className="text-[11px] font-mono text-ink-400">Order Ref: {data.orderNo}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-ink-50 text-ink-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Telemetry Metric</th>
                    <th className="py-2.5 px-3">Measured Value</th>
                    <th className="py-2.5 px-3">Standard Reference</th>
                    <th className="py-2.5 px-3 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line font-mono">
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-ink-700">Valve Actuation Duration</td>
                    <td className="py-2.5 px-3 font-bold text-ink-900">{data.sensorLog.valveOpenMs} ms</td>
                    <td className="py-2.5 px-3 text-ink-500">14,000 ms</td>
                    <td className="py-2.5 px-3 text-right text-amber-600 font-semibold">Short Cutoff</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-ink-700">Hall-Effect Flow Pulses</td>
                    <td className="py-2.5 px-3 font-bold text-ink-900">{data.sensorLog.flowPulses} pulses</td>
                    <td className="py-2.5 px-3 text-ink-500">720 pulses</td>
                    <td className="py-2.5 px-3 text-right text-rose-600 font-bold">-40% Pulses</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-ink-700">Volume Dispensed</td>
                    <td className="py-2.5 px-3 font-bold text-rose-600 text-sm">{data.sensorLog.dispensedMl} ml</td>
                    <td className="py-2.5 px-3 text-ink-500">{data.sensorLog.expectedMl} ml</td>
                    <td className="py-2.5 px-3 text-right text-rose-600 font-bold">Underfilled</td>
                  </tr>
                  <tr className="bg-amber-50/50 font-bold">
                    <td className="py-2.5 px-3 font-sans text-amber-900">Flow Variance Percentage</td>
                    <td className="py-2.5 px-3 text-rose-600 text-sm">{data.sensorLog.variancePct}%</td>
                    <td className="py-2.5 px-3 text-ink-500">±5% Tolerated</td>
                    <td className="py-2.5 px-3 text-right text-rose-600">VIOLATION (&gt;15%)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-ink-700">Cup Drop Sensor</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-bold">DETECTED (OK)</td>
                    <td className="py-2.5 px-3 text-ink-500">Optical Bay Trigger</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600">PASS</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-ink-700">Kit Drop Mechanism</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-bold">DROPPED (OK)</td>
                    <td className="py-2.5 px-3 text-ink-500">Solenoid 2 Pulse</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600">PASS</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Machine Health Timeline (±10 minutes around order) */}
          <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-ink-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Machine Health Timeline (±10m Around Order Dispense)</span>
            </h3>

            <div className="relative pt-2">
              <div className="absolute top-6 inset-x-4 h-1 bg-ink-200 -z-0" />
              <div className="grid grid-cols-6 gap-2 text-center relative z-10">
                {data.healthTimeline.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-xs mb-2"
                      style={{ backgroundColor: item.color }}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-ink-900 block">
                      {item.relativeMins}
                    </span>
                    <span className="text-[10.5px] text-ink-500 leading-tight mt-1 line-clamp-2">
                      {item.event}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM VERDICT BAR ("The Money Bar") */}
      <div className="fixed bottom-0 inset-x-0 bg-ink-950/95 backdrop-blur-md border-t border-ink-800 p-4 z-40 text-white shadow-2xl">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-400">Refund Destination:</span>
              <div className="flex items-center gap-1 bg-ink-900 p-1 rounded-lg text-xs font-mono">
                <button
                  onClick={() => setRefundDestination('UPI')}
                  className={`px-2.5 py-1 rounded transition ${
                    refundDestination === 'UPI' ? 'bg-brand-500 text-white font-bold' : 'text-ink-400 hover:text-white'
                  }`}
                >
                  UPI Source Account
                </button>
                <button
                  onClick={() => setRefundDestination('WALLET')}
                  className={`px-2.5 py-1 rounded transition ${
                    refundDestination === 'WALLET' ? 'bg-brand-500 text-white font-bold' : 'text-ink-400 hover:text-white'
                  }`}
                >
                  Float In-App Wallet
                </button>
              </div>
            </div>

            {verdictResolved && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Verdict: {verdictResolved}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1. Approve Refund (Green) */}
            <button
              onClick={handleApproveRefund}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-900/40 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Refund (₹{data.amount})</span>
            </button>

            {/* 2. Reject with Proof (Red) */}
            <button
              onClick={handleRejectWithProof}
              className="px-4 py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-semibold rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject with Proof</span>
            </button>

            {/* 3. Request Info */}
            <button
              onClick={() => sonnerToast.info('SMS inquiry sent to customer requesting photo')}
              className="px-3.5 py-2.5 bg-ink-800 hover:bg-ink-700 text-ink-200 text-xs font-medium rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Request Info</span>
            </button>

            {/* 4. Escalate */}
            <button
              onClick={handleEscalate}
              className="px-3.5 py-2.5 bg-ink-800 hover:bg-ink-700 text-amber-400 text-xs font-medium rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Escalate</span>
            </button>

            {/* 5. Blacklist */}
            <button
              onClick={handleBlacklist}
              className="px-3.5 py-2.5 bg-ink-900 hover:bg-rose-950 text-rose-400 text-xs font-medium rounded-xl transition border border-ink-800 hover:border-rose-900 cursor-pointer flex items-center gap-1.5"
              title="Add phone number to Fraud Blacklist"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Blacklist</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
