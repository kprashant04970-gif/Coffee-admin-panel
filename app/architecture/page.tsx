'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import ArchitectureModule from '@/components/modules/ArchitectureModule';

export default function ArchitecturePage() {
  return (
    <AdminShell>
      <ArchitectureModule />
    </AdminShell>
  );
}
