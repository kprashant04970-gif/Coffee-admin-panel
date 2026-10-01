'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import { ArrowRight, ShieldCheck, Mail, Key } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useAdmin();
  const [email, setEmail] = useState('admin@manhattancoffee.in');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState('888222');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'owner' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        if (data.demoCode) {
          setDemoCode(data.demoCode);
          setOtp(data.demoCode);
        }
        toast(`Security OTP dispatched to operator terminal: ${data.demoCode || '888222'}`, 'info');
      } else {
        toast(data.error || 'Failed to dispatch OTP', 'error');
      }
    } catch {
      toast('Network error dispatching OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, role: 'owner' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('Operator identity authenticated. Proceeding to 2FA...', 'success');
        router.push('/mfa');
      } else {
        toast(data.error || 'Invalid OTP code', 'error');
      }
    } catch {
      toast('Verification network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col justify-center items-center p-4 selection:bg-brand-100">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-500 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-sm">
            M
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Manhattan<span className="text-brand-500">Coffee</span> Console
          </h1>
          <p className="text-xs text-ink-500">
            Self-Hosted VPS Gateway · Automated Vending Network
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-6 border-line bg-white shadow-sm space-y-5">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink-700 mb-1">
                  Registered Operator Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-line rounded-lg font-mono text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Dispatching...' : 'Request Single-Use OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4 text-xs">
              <div className="p-3 bg-brand-50 border border-brand-100 rounded-lg text-brand-800">
                <p className="font-semibold">OTP dispatched to {email}</p>
                <p className="text-[11px] mt-0.5 opacity-90">Auto-filled code: <b>{demoCode}</b></p>
              </div>

              <div>
                <label className="block font-semibold text-ink-700 mb-1">
                  Enter 6-Digit Verification Code
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="888222"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center tracking-widest text-lg font-mono font-bold py-2 border border-line rounded-lg outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Verifying...' : 'Verify & Proceed to MFA'}</span>
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-line flex justify-between text-xs text-ink-500">
            <Link href="/forgot-password" className="hover:text-brand-600">
              Recovery Options
            </Link>
            <Link href="/" className="hover:text-brand-600 font-semibold">
              Skip to Live Dashboard →
            </Link>
          </div>
        </div>

        {/* VPS Fleet Status Teaser Footer */}
        <div className="text-center text-xs text-ink-400 font-mono">
          VPS Database: PostgreSQL 16 · Native Socket Active · 0 External Dependencies
        </div>
      </div>
    </div>
  );
}
