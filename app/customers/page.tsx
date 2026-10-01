'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import CustomersModule from '@/components/modules/CustomersModule';

export default function CustomersPage() {
  return (
    <AdminShell>
      <CustomersModule />
    </AdminShell>
  );
}
