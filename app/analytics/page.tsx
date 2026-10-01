'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import AnalyticsModule from '@/components/modules/AnalyticsModule';

export default function AnalyticsPage() {
  return (
    <AdminShell>
      <AnalyticsModule />
    </AdminShell>
  );
}
