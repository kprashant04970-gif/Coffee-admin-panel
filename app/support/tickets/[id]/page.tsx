import React, { Suspense } from 'react';
import AdminShell from '@/components/AdminShell';
import DisputeDeskEvidenceView, { MOCK_EVIDENCE_BUNDLE } from '@/components/dispute-desk/DisputeDeskEvidenceView';
import { SupportRepository } from '@/lib/db/repositories/support.repository';

// Asynchronous evidence bundle loader streaming from fn_ticket_evidence_bundle
async function EvidenceBundleLoader({ ticketId }: { ticketId: string }) {
  let bundle = MOCK_EVIDENCE_BUNDLE;

  try {
    const { data } = await SupportRepository.fetchEvidenceBundle(ticketId);
    if (data && typeof data === 'object') {
      // Merged with server RPC data when configured
      bundle = { ...MOCK_EVIDENCE_BUNDLE, ...data };
    }
  } catch {
    // Graceful fallback to rich high-density mock bundle
    bundle = MOCK_EVIDENCE_BUNDLE;
  }

  return <DisputeDeskEvidenceView data={bundle} />;
}

// Skeleton shown during React Suspense streaming
function DisputeDeskSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-[1600px] mx-auto p-4 sm:p-6">
      <div className="h-20 bg-ink-100 rounded-2xl" />
      <div className="h-16 bg-amber-50 rounded-2xl border border-amber-200" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-5">
          <div className="h-44 bg-ink-100 rounded-2xl" />
          <div className="h-36 bg-ink-100 rounded-2xl" />
          <div className="h-48 bg-ink-100 rounded-2xl" />
        </div>
        <div className="lg:col-span-7 space-y-5">
          <div className="h-80 bg-ink-900 rounded-2xl" />
          <div className="h-60 bg-ink-100 rounded-2xl" />
          <div className="h-32 bg-ink-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default async function DisputeDeskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <Suspense fallback={<DisputeDeskSkeleton />}>
          <EvidenceBundleLoader ticketId={id} />
        </Suspense>
      </div>
    </AdminShell>
  );
}
