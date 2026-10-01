'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import DashboardModule from '@/components/modules/DashboardModule';

export default function HomePage() {
  return (
    <AdminShell>
      <DashboardModule />
    </AdminShell>
  );
}
