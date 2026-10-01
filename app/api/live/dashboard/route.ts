import { NextResponse } from 'next/server';
import { DashboardRepository } from '@/lib/db/repositories/dashboard.repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const metrics = await DashboardRepository.getLiveMetrics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}
