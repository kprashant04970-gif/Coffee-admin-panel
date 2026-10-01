'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import { Shield, KeyRound, ArrowRight } from 'lucide-react';

export default function MfaPage() {
  const router = useRouter();
  const { toast } = useAdmin();
  const [totp, setTotp] = useState('749201');
  const [trustDevice, setTrustDevice] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaCode: totp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('Hardware TOTP token accepted. Session authorized on VPS.', 'success');
        router.push('/');
      } else {
        toast(data.error || 'Invalid 2FA token', 'error');
      }
    } catch {
      toast('Network error verifying MFA', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col justify-center items-center p-4 selection:bg-brand-100">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-ink-900 text-brand-500 font-bold text-2xl flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Second-Factor Authentication (2FA)
          </h1>
          <p className="text-xs text-ink-500">
            Enter 6-digit code from Google Authenticator or Yubikey
          </p>
        </div>

        <div className="card p-6 border-line bg-white shadow-sm space-y-5">
          <form onSubmit={handleVerifyMfa} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ink-700 mb-1">
                Time-based One-Time Password (TOTP)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                  className="w-full text-center tracking-widest text-xl font-mono font-bold py-2 border border-line rounded-lg outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-ink-600">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="rounded border-line text-brand-500 focus:ring-brand-500"
              />
              <span>Trust this operator workstation for 30 days</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Validating...' : 'Authorize Full Admin Session'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-line flex justify-between text-xs text-ink-500">
            <Link href="/login" className="hover:text-brand-600">
              ← Switch Account
            </Link>
            <span className="font-mono text-[11px] text-ink-400">
              MFA Hardware Key Active
            </span>
          </div>
        </div>

        <div className="text-center text-xs text-ink-400 font-mono">
          Security Level: Tier 3 Physical Token · Hostinger VPS Node
        </div>
      </div>
    </div>
  );
}
