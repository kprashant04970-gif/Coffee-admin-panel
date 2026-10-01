'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import OrdersModule from '@/components/modules/OrdersModule';

export default function OrdersPage() {
  return (
    <AdminShell>
      <OrdersModule />
    </AdminShell>
  );
}
