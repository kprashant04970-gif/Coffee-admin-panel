'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import AdminShell from '@/components/AdminShell';
import MachinesModule from '@/components/modules/MachinesModule';

export default function MachineDetailPage() {
  const params = useParams();
  const { setSelectedMachineId, setMachineActiveTab } = useAdmin();

  useEffect(() => {
    if (params?.id) {
      setSelectedMachineId(params.id as string);
      setMachineActiveTab('overview');
    }
  }, [params, setSelectedMachineId, setMachineActiveTab]);

  return (
    <AdminShell>
      <MachinesModule />
    </AdminShell>
  );
}
