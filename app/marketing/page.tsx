'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import MarketingModule from '@/components/modules/MarketingModule';

export default function MarketingPage() {
  return (
    <AdminShell>
      <MarketingModule />
    </AdminShell>
  );
}
