'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import InventoryModule from '@/components/modules/InventoryModule';

export default function InventoryPage() {
  return (
    <AdminShell>
      <InventoryModule />
    </AdminShell>
  );
}
