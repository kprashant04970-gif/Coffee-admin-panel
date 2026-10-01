'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import MachinesModule from '@/components/modules/MachinesModule';

export default function MachinesPage() {
  return (
    <AdminShell>
      <MachinesModule />
    </AdminShell>
  );
}
