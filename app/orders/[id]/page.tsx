'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import AdminShell from '@/components/AdminShell';
import OrdersModule from '@/components/modules/OrdersModule';

export default function OrderDetailPage() {
  const params = useParams();
  const { setSelectedOrderId } = useAdmin();

  useEffect(() => {
    if (params?.id) {
      setSelectedOrderId(params.id as string);
    }
  }, [params, setSelectedOrderId]);

  return (
    <AdminShell>
      <OrdersModule />
    </AdminShell>
  );
}
