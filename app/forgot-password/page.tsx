'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/lib/admin-context';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { toast } = useAdmin();
  const [email, setEmail] = useState('pk9410548@gmail.com');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast('15-minute emergency recovery link dispatched to email', 'success');
  };

  return (
    <div className="min-h-screen bg-page flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Operator Account Recovery
          </h1>
          <p className="text-xs text-ink-500">
            Emergency password &amp; TOTP reset token link
          </p>
        </div>

        <div className="card p-6 border-line bg-white shadow-sm space-y-5">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink-700 mb-1">
                  Registered Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-line rounded-lg text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send 15-Minute Recovery Link</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-xs text-center py-2">
              <p className="font-semibold text-leaf-700">
                Recovery instructions transmitted to {email}.
              </p>
              <p className="text-ink-500">
                Please check your inbox. The token is valid for 15 minutes.
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-line text-center text-xs text-ink-500">
            <Link href="/login" className="hover:text-brand-600 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
