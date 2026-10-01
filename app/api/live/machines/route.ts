import { NextResponse } from 'next/server';
import { MachineRepository } from '@/lib/db/repositories/machine.repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const machines = await MachineRepository.getAll();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: machines.length,
      onlineCount: machines.filter((m) => m.status === 'ONLINE').length,
      faultCount: machines.filter((m) => m.status === 'FAULT').length,
      data: machines,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch machines telemetry' }, { status: 500 });
  }
}
