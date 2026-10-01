'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import { Lock, ArrowRight, ShieldCheck, Phone } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useAdmin();
  const [phone, setPhone] = useState('+91 98200 11999');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
    toast('Security OTP dispatched: 894012 (Demo)', 'info');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Operator authentication verified. Redirecting to 2FA...', 'success');
    router.push('/mfa');
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
            Operator Access · Automated Vending Network
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-6 border-line bg-white shadow-sm space-y-5">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink-700 mb-1">
                  Registered Operator Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-line rounded-lg font-mono text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Request Single-Use OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4 text-xs">
              <div className="p-3 bg-brand-50 border border-brand-100 rounded-lg text-brand-800">
                <p className="font-semibold">OTP sent to {phone}</p>
                <p className="text-[11px] mt-0.5 opacity-90">Demo code: <b>894012</b></p>
              </div>

              <div>
                <label className="block font-semibold text-ink-700 mb-1">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="894012"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-mono font-bold py-2 border border-line rounded-lg outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify &amp; Proceed to MFA</span>
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

        {/* Machine Teaser Footer */}
        <div className="text-center text-xs text-ink-400 font-mono">
          Fleet Health: 2 / 2 Units Online · MCH-001 65.4°C · MCH-002 6.2°C
        </div>
      </div>
    </div>
  );
}
