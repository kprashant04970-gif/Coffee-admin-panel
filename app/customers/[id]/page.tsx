'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import AdminShell from '@/components/AdminShell';
import CustomersModule from '@/components/modules/CustomersModule';

export default function CustomerProfilePage() {
  const params = useParams();
  const { setSelectedCustomerId } = useAdmin();

  useEffect(() => {
    if (params?.id) {
      setSelectedCustomerId(params.id as string);
    }
  }, [params, setSelectedCustomerId]);

  return (
    <AdminShell>
      <CustomersModule />
    </AdminShell>
  );
}
