import type { Metadata } from 'next';
import './globals.css';
import { AdminProvider } from '@/lib/admin-context';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Manhattan Coffee — Admin Console & Routing Architecture',
  description: 'Operations, Fleet Telemetry, Dispute Desk, and Growth Management for Manhattan Coffee Vending Network.',
  openGraph: {
    title: 'Manhattan Coffee — Admin Console & Routing Architecture',
    description: 'Operations, Fleet Telemetry, Dispute Desk, and Growth Management for Manhattan Coffee Vending Network.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manhattan Coffee — Admin Console & Routing Architecture',
    description: 'Operations, Fleet Telemetry, Dispute Desk, and Growth Management for Manhattan Coffee Vending Network.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-page text-ink-900 antialiased selection:bg-brand-100 selection:text-brand-700">
        <AdminProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AdminProvider>
      </body>
    </html>
  );
}
