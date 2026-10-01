'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import { Shield, KeyRound, ArrowRight } from 'lucide-react';

export default function MfaPage() {
  const router = useRouter();
  const { toast } = useAdmin();
  const [totp, setTotp] = useState('');
  const [trustDevice, setTrustDevice] = useState(true);

  const handleVerifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Hardware TOTP token accepted. Session authorized.', 'success');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-page flex flex-col justify-center items-center p-4">
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
                  placeholder="000 000"
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
                className="rounded border-line text-brand-500"
              />
              <span>Trust this operator workstation for 30 days</span>
            </label>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Unlock Console Shell</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-line text-center text-xs text-ink-500">
            <Link href="/login" className="hover:text-brand-600">
              ← Return to Phone Verification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
