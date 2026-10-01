import Link from 'next/link';
import { ArrowLeft, Coffee } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-page flex flex-col justify-center items-center p-6 text-center">
      <div className="max-w-md w-full space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto shadow-xs">
          <Coffee className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold font-mono text-ink-900">404 · Route Not Found</h1>
        <p className="text-xs text-ink-500 leading-relaxed">
          The requested administrative endpoint or vending unit record does not exist on the Manhattan Coffee network.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Operations Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
