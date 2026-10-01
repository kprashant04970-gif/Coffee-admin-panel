import { supabase, db } from '../client';
import { Database } from '@/types/database';

export type TicketRow = Database['public']['Tables']['support_tickets']['Row'];

export class SupportRepository {
  public static async getTicketById(id: string): Promise<TicketRow | null> {
    const { data } = await (supabase.from('support_tickets') as any).select('*').eq('id', id).single();
    return data as TicketRow | null;
  }

  public static async fetchEvidenceBundle(ticketId: string) {
    return db.rpc('fn_ticket_evidence_bundle', { p_ticket_id: ticketId });
  }

  public static async resolveDispute(ticketId: string, verdict: string, resolutionNote: string, adminName: string) {
    return db.rpc('fn_resolve_dispute', {
      p_ticket_id: ticketId,
      p_verdict: verdict,
      p_resolution_note: resolutionNote,
      p_admin_name: adminName,
    });
  }
}
