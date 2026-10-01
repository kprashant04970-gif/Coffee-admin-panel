'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import SettingsModule from '@/components/modules/SettingsModule';

export default function SettingsPage() {
  return (
    <AdminShell>
      <SettingsModule />
    </AdminShell>
  );
}
