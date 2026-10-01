'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import AdminShell from '@/components/AdminShell';
import SupportModule from '@/components/modules/SupportModule';

export default function DisputeDeskDetailPage() {
  const params = useParams();
  const { setSelectedTicketId } = useAdmin();

  useEffect(() => {
    if (params?.id) {
      setSelectedTicketId(params.id as string);
    }
  }, [params, setSelectedTicketId]);

  return (
    <AdminShell>
      <SupportModule />
    </AdminShell>
  );
}
