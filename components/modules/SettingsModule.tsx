'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import {
  Settings,
  Shield,
  CreditCard,
  Bell,
  Users,
  Key,
  Palette,
  FileText,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Lock,
  Layers,
} from 'lucide-react';

export default function SettingsModule() {
  const { auditLogs, toast, role } = useAdmin();
  const [subTab, setSubTab] = useState<
    'general' | 'machines' | 'payments' | 'notifications' | 'team' | 'integrations' | 'security' | 'appearance' | 'billing'
  >('general');

  // Security secret rotation modal
  const [rotationModalOpen, setRotationModalOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-ink-900">
            Fleet Architecture &amp; System Settings
          </h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            Fleetwide temperature defaults, HMAC QR signing secrets, RBAC team roles, and gateways.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-page border border-line rounded-lg px-3 py-1.5 text-xs text-ink-600 font-mono">
          <span>Active Role:</span>
          <b className="uppercase text-brand-600 font-bold">{role}</b>
        </div>
      </div>

      {/* Settings Sub Tabs (9 routes) */}
      <div className="flex border-b border-line text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setSubTab('general')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subTab === 'general'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          General &amp; Brand
        </button>
        <button
          onClick={() => setSubTab('machines')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subTab === 'machines'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Fleet Defaults
        </button>
        <button
          onClick={() => setSubTab('payments')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subTab === 'payments'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Payment Gateways
        </button>
        <button
          onClick={() => setSubTab('notifications')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subTab === 'notifications'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Alert Rules
        </button>
        <button
          onClick={() => setSubTab('team')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subTab === 'team'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Team &amp; RBAC Roles
        </button>
        <button
          onClick={() => setSubTab('integrations')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subTab === 'integrations'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Integrations
        </button>
        <button
          onClick={() => setSubTab('security')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subTab === 'security'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Security &amp; Audit Trail
        </button>
        <button
          onClick={() => setSubTab('appearance')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subTab === 'appearance'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Theme &amp; Colors
        </button>
        <button
          onClick={() => setSubTab('billing')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subTab === 'billing'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Fleet Plan &amp; Billing
        </button>
      </div>

      {/* 1. GENERAL */}
      {subTab === 'general' && (
        <div className="card p-6 border-line max-w-2xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-ink-900">Brand Identity &amp; Support Contacts</h3>
          <div>
            <label className="block font-semibold text-ink-700 mb-1">Company Trading Name</label>
            <input
              type="text"
              defaultValue="Manhattan Coffee Automated Vending Network LLP"
              className="w-full px-3 py-2 border border-line rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-ink-700 mb-1">Customer Support WhatsApp</label>
            <input
              type="text"
              defaultValue="+91 98200 11999"
              className="w-full px-3 py-2 border border-line rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-ink-700 mb-1">FSSAI License Registration</label>
            <input
              type="text"
              defaultValue="11526999000142"
              className="w-full px-3 py-2 border border-line rounded-lg font-mono"
            />
          </div>
          <button
            onClick={() => toast('General settings saved', 'success')}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold shadow-xs"
          >
            Save Brand Details
          </button>
        </div>
      )}

      {/* 2. FLEET DEFAULTS */}
      {subTab === 'machines' && (
        <div className="card p-6 border-line max-w-2xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-ink-900">Fleet Standard Operating Baselines</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-ink-700 mb-1">Default Hot Boiler (°C)</label>
              <input
                type="number"
                defaultValue={66.0}
                className="w-full px-3 py-2 border border-line rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink-700 mb-1">Default Cold Chiller (°C)</label>
              <input
                type="number"
                defaultValue={6.0}
                className="w-full px-3 py-2 border border-line rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink-700 mb-1">FSSAI Max Tank Hold Limit</label>
              <input
                type="text"
                defaultValue="18 hours"
                disabled
                className="w-full px-3 py-2 border border-line rounded-lg bg-page font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink-700 mb-1">Low-Stock Buffer Warning</label>
              <input
                type="number"
                defaultValue={20}
                className="w-full px-3 py-2 border border-line rounded-lg font-mono"
              />
            </div>
          </div>
          <button
            onClick={() => toast('Fleet defaults saved', 'success')}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold shadow-xs"
          >
            Save Fleet Defaults
          </button>
        </div>
      )}

      {/* 3. PAYMENTS & GATEWAYS */}
      {subTab === 'payments' && (
        <div className="card p-6 border-line max-w-2xl space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink-900">Payment Gateway Integrations</h3>
            <button
              onClick={() => toast('Gateway ping response 200 OK (latency 42ms)', 'success')}
              className="px-3 py-1.5 border border-line bg-page text-xs font-semibold hover:bg-white rounded-lg"
            >
              Test Ping Gateways
            </button>
          </div>
          <div>
            <label className="block font-semibold text-ink-700 mb-1">Razorpay Live Key ID</label>
            <input
              type="text"
              defaultValue="rzp_live_891048291038"
              className="w-full px-3 py-2 border border-line rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-ink-700 mb-1">Webhook Endpoint URL</label>
            <input
              type="text"
              defaultValue="https://api.manhattancoffee.in/webhooks/razorpay"
              className="w-full px-3 py-2 border border-line rounded-lg font-mono bg-page"
              readOnly
            />
          </div>
        </div>
      )}

      {/* 4. NOTIFICATIONS */}
      {subTab === 'notifications' && (
        <div className="card p-6 border-line max-w-2xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-ink-900">Alert Rules &amp; Dispatch Escalations</h3>
          <div className="space-y-3">
            <div className="p-3 border border-line rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-ink-900">5-Minute SLA Dispute Escalation</p>
                <p className="text-ink-500 text-[11px]">Send SMS to Owner if ticket unassigned for &gt;4m</p>
              </div>
              <span className="text-leaf-600 font-bold bg-leaf-50 px-2 py-0.5 rounded">ACTIVE</span>
            </div>
            <div className="p-3 border border-line rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-ink-900">Milk Tank Expiry Cutoff (2h Warning)</p>
                <p className="text-ink-500 text-[11px]">Send WhatsApp alert to on-duty route technician</p>
              </div>
              <span className="text-leaf-600 font-bold bg-leaf-50 px-2 py-0.5 rounded">ACTIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. TEAM & RBAC */}
      {subTab === 'team' && (
        <div className="card overflow-hidden border-line">
          <div className="p-4 border-b border-line bg-page text-xs font-bold text-ink-900">
            Admin Operators &amp; Role-Based Access Control (RBAC)
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-page/70 text-[10px] text-ink-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">2FA Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr className="hover:bg-page/50">
                <td className="py-3.5 px-4 font-bold text-ink-900">Chief Rohan (pk9410548@gmail.com)</td>
                <td className="py-3.5 px-4">
                  <span className="bg-brand-50 text-brand-700 font-bold px-2 py-0.5 rounded text-[11px]">
                    owner (Root)
                  </span>
                </td>
                <td className="py-3.5 px-4 text-leaf-600 font-bold">✓ Enforced (TOTP)</td>
                <td className="py-3.5 px-4 text-ink-500 font-mono">Just now</td>
                <td className="py-3.5 px-4 text-right text-ink-400">Primary</td>
              </tr>
              <tr className="hover:bg-page/50">
                <td className="py-3.5 px-4 font-semibold text-ink-900">Suresh K. (Technician Lead)</td>
                <td className="py-3.5 px-4">
                  <span className="bg-leaf-50 text-leaf-700 font-bold px-2 py-0.5 rounded text-[11px]">
                    ops
                  </span>
                </td>
                <td className="py-3.5 px-4 text-leaf-600 font-bold">✓ Enforced (SMS)</td>
                <td className="py-3.5 px-4 text-ink-500 font-mono">04:30 AM</td>
                <td className="py-3.5 px-4 text-right">
                  <button className="text-brand-500 hover:underline">Edit Role</button>
                </td>
              </tr>
              <tr className="hover:bg-page/50">
                <td className="py-3.5 px-4 font-semibold text-ink-900">Support Desk Agent 01</td>
                <td className="py-3.5 px-4">
                  <span className="bg-amber2-50 text-amber2-700 font-bold px-2 py-0.5 rounded text-[11px]">
                    support
                  </span>
                </td>
                <td className="py-3.5 px-4 text-leaf-600 font-bold">✓ Active</td>
                <td className="py-3.5 px-4 text-ink-500 font-mono">11:42 AM</td>
                <td className="py-3.5 px-4 text-right">
                  <button className="text-brand-500 hover:underline">Edit Role</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 6. INTEGRATIONS */}
      {subTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="card p-4 border-line flex items-start justify-between">
            <div>
              <p className="font-bold text-ink-900">Supabase Cloud Database</p>
              <p className="text-ink-500 mt-0.5">PostgreSQL partitions + Realtime websocket listener</p>
              <span className="text-leaf-600 font-bold mt-2 inline-block">● Connected (Latency 24ms)</span>
            </div>
            <button
              onClick={() => toast('Supabase connection verified', 'success')}
              className="px-2.5 py-1 border border-line rounded hover:bg-page"
            >
              Test
            </button>
          </div>

          <div className="card p-4 border-line flex items-start justify-between">
            <div>
              <p className="font-bold text-ink-900">WhatsApp Business API</p>
              <p className="text-ink-500 mt-0.5">Meta Cloud API for automated OTP and order receipt stubs</p>
              <span className="text-leaf-600 font-bold mt-2 inline-block">● Active (Tier 2 Verified)</span>
            </div>
            <button
              onClick={() => toast('WhatsApp API ping verified', 'success')}
              className="px-2.5 py-1 border border-line rounded hover:bg-page"
            >
              Test
            </button>
          </div>
        </div>
      )}

      {/* 7. SECURITY & AUDIT TRAIL */}
      {subTab === 'security' && (
        <div className="space-y-6">
          {/* QR Signing Secret Rotation Card (Highlighted in workflow) */}
          <div className="card p-5 border-rose-200 bg-rose-50/40 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">
                  Critical Cryptographic Setting
                </span>
                <h3 className="text-base font-bold text-ink-900 mt-0.5">
                  QR Code HMAC-SHA256 Signing Secret
                </h3>
                <p className="text-xs text-ink-600 mt-1 max-w-2xl leading-relaxed">
                  Every offline QR code is digitally signed with this master secret. Rotating this key will invalidate every unredeemed paper or digital QR code in the field and require an OTA firmware configuration update to all vending units.
                </p>
              </div>

              <button
                onClick={() => setRotationModalOpen(true)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs shrink-0 cursor-pointer"
              >
                Rotate Signing Secret
              </button>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="card overflow-hidden border-line">
            <div className="p-4 border-b border-line bg-page text-xs font-bold text-ink-900 flex justify-between">
              <span>Immutable System Audit Trail</span>
              <span className="text-ink-400 font-mono">Logged before/after JSON diffs</span>
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-page/70 text-[10px] text-ink-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4">Admin</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Target</th>
                  <th className="py-2.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-page/50">
                    <td className="py-3 px-4 text-ink-500 font-sans">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-ink-900 font-sans">{log.adminName}</td>
                    <td className="py-3 px-4 uppercase text-brand-600 font-bold">{log.role}</td>
                    <td className="py-3 px-4 text-ink-700">{log.action}</td>
                    <td className="py-3 px-4 text-ink-900 font-bold">{log.target}</td>
                    <td className="py-3 px-4 text-ink-500 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. APPEARANCE */}
      {subTab === 'appearance' && (
        <div className="card p-6 border-line max-w-2xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-ink-900">Brand Color System &amp; Palette</h3>
          <p className="text-ink-500">
            Complies with the 60-30-10 palette constitution. Accent budget reserved for high-intent actions.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-line bg-page">
              <div className="w-8 h-8 rounded-lg bg-brand-500 mb-2 shadow-xs" />
              <p className="font-bold text-ink-900">Brand Orange</p>
              <p className="text-[11px] font-mono text-ink-400">#F04E23</p>
            </div>
            <div className="p-3 rounded-xl border border-line bg-page">
              <div className="w-8 h-8 rounded-lg bg-leaf-500 mb-2 shadow-xs" />
              <p className="font-bold text-ink-900">Leaf Green</p>
              <p className="text-[11px] font-mono text-ink-400">#16A34A</p>
            </div>
            <div className="p-3 rounded-xl border border-line bg-page">
              <div className="w-8 h-8 rounded-lg bg-amber2-500 mb-2 shadow-xs" />
              <p className="font-bold text-ink-900">Amber Warn</p>
              <p className="text-[11px] font-mono text-ink-400">#EAB308</p>
            </div>
          </div>
        </div>
      )}

      {/* 9. BILLING & FLEET PLAN */}
      {subTab === 'billing' && (
        <div className="card p-6 border-line max-w-2xl space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-600">Enterprise Fleet Plan</span>
              <h3 className="text-base font-bold text-ink-900 mt-0.5">Scale Tier · 5 Active Units</h3>
            </div>
            <span className="text-leaf-600 font-bold bg-leaf-50 px-2.5 py-1 rounded-md text-xs">
              ACTIVE
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-ink-500">Fleet Units Licensed:</span>
              <span className="font-bold text-ink-900">3 of 10 In-Use</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Cellular IoT Telemetry:</span>
              <span className="font-mono text-ink-900">Unlimited eSIM roaming</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Video Storage Retention:</span>
              <span className="font-mono text-ink-900">7 Days Cloud Loop</span>
            </div>
          </div>
        </div>
      )}

      {/* Secret Rotation Modal */}
      {rotationModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-line rounded-2xl p-6 max-w-md w-full shadow-pop">
            <div className="flex items-center gap-2 text-rose-600 font-bold mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base text-ink-900">Confirm Secret Key Rotation</h3>
            </div>
            <p className="text-xs text-ink-600 leading-relaxed mb-4">
              Are you sure? Rotating the QR HMAC secret will immediately cause all unredeemed QR tokens in customer wallets to fail verification until reissued.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setRotationModalOpen(false)}
                className="px-4 py-2 text-ink-500 hover:bg-page rounded-lg"
              >
                Abort
              </button>
              <button
                onClick={() => {
                  toast('Secret rotated! Broadcast OTA configuration dispatched to fleet.', 'warn');
                  setRotationModalOpen(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Proceed With Rotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
