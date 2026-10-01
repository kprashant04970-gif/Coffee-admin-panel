import { NextResponse } from 'next/server';
import { SupportRepository } from '@/lib/db/repositories/support.repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const tickets = await SupportRepository.getAll();
    const openTickets = tickets.filter((t) => t.status === 'OPEN');
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalTickets: tickets.length,
      openTicketsCount: openTickets.length,
      urgentSlaCount: openTickets.filter((t) => t.sla_seconds_remaining < 180).length,
      data: tickets,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch support queue' }, { status: 500 });
  }
}
