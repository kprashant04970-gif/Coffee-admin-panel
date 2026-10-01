/**
 * Manhattan Coffee — Dispute Desk & Support Repository (PostgreSQL Native)
 * File: lib/db/repositories/support.repository.ts
 */

import { query } from '../client';
import { INITIAL_TICKETS } from '@/lib/mock-data';

export interface SupportTicketRecord {
  id: string;
  ticket_no: string;
  order_id: string;
  machine_id: string;
  customer_id: string;
  customer_name: string;
  issue_type: string;
  status: string;
  priority: string;
  flow_rate_variance: number;
  expected_grams: number;
  dispensed_grams: number;
  video_clip_uri?: string;
  sla_seconds_remaining: number;
  operator_verdict?: string;
  operator_note?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export class SupportRepository {
  public static async getAll(): Promise<SupportTicketRecord[]> {
    try {
      const res = await query<SupportTicketRecord>(
        'SELECT * FROM support_tickets ORDER BY created_at DESC'
      );
      if (res.rows.length > 0) return res.rows;
    } catch {
      // Fallback
    }
    return INITIAL_TICKETS.map((t) => ({
      id: t.id,
      ticket_no: t.ticketNo,
      order_id: t.orderId,
      machine_id: t.machineId,
      customer_id: t.customerId,
      customer_name: t.customerName,
      issue_type: t.reasonLabel || t.reason,
      status: t.status,
      priority: t.priority,
      flow_rate_variance: t.dispenseVariance,
      expected_grams: 220,
      dispensed_grams: 180,
      video_clip_uri: t.clipUrl,
      sla_seconds_remaining: t.slaRemainingMinutes * 60,
      operator_verdict: t.resolution,
      operator_note: t.customerMessage,
      resolved_by: t.resolvedBy,
      resolved_at: t.resolvedAt,
      created_at: t.claimedAt,
    }));
  }

  public static async getById(idOrTicketNo: string): Promise<SupportTicketRecord | null> {
    try {
      const res = await query<SupportTicketRecord>(
        'SELECT * FROM support_tickets WHERE id = $1 OR ticket_no = $1 LIMIT 1',
        [idOrTicketNo]
      );
      if (res.rows.length > 0) return res.rows[0];
    } catch {
      // Fallback
    }
    const found = INITIAL_TICKETS.find(
      (t) => t.id === idOrTicketNo || t.ticketNo === idOrTicketNo
    );
    if (!found) return null;
    return {
      id: found.id,
      ticket_no: found.ticketNo,
      order_id: found.orderId,
      machine_id: found.machineId,
      customer_id: found.customerId,
      customer_name: found.customerName,
      issue_type: found.reasonLabel || found.reason,
      status: found.status,
      priority: found.priority,
      flow_rate_variance: found.dispenseVariance,
      expected_grams: 220,
      dispensed_grams: 180,
      video_clip_uri: found.clipUrl,
      sla_seconds_remaining: found.slaRemainingMinutes * 60,
      operator_verdict: found.resolution,
      operator_note: found.customerMessage,
      resolved_by: found.resolvedBy,
      resolved_at: found.resolvedAt,
      created_at: found.claimedAt,
    };
  }

  public static async fetchEvidenceBundle(ticketId: string): Promise<{ data: any; error: any }> {
    try {
      const ticket = await this.getById(ticketId);
      if (ticket) {
        return {
          data: {
            ticket: {
              id: ticket.id,
              ticketNo: ticket.ticket_no,
              orderId: ticket.order_id,
              machineId: ticket.machine_id,
              customerName: ticket.customer_name,
              issue: ticket.issue_type,
              status: ticket.status,
              priority: ticket.priority,
              variance: ticket.flow_rate_variance,
              expectedGrams: ticket.expected_grams,
              dispensedGrams: ticket.dispensed_grams,
              videoClipUrl: ticket.video_clip_uri,
              slaRemainingSeconds: ticket.sla_seconds_remaining,
              createdAt: ticket.created_at,
            },
          },
          error: null,
        };
      }
    } catch (err) {
      return { data: null, error: err };
    }
    return { data: null, error: null };
  }

  public static async resolveDispute(
    ticketId: string,
    verdict: 'APPROVED' | 'REJECTED' | 'REQUEST_INFO' | 'BLACKLIST',
    note: string,
    operatorEmail: string
  ): Promise<{ success: boolean; status: string; ticketId: string }> {
    const status = verdict === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    try {
      await query(
        `UPDATE support_tickets 
         SET status = $1, operator_verdict = $2, operator_note = $3, resolved_by = $4, resolved_at = NOW() 
         WHERE id = $5 OR ticket_no = $5`,
        [status, verdict, note, operatorEmail, ticketId]
      );
      await query(
        'INSERT INTO audit_logs (user_id, user_role, action, permission, status, details) VALUES ($1, $2, $3, $4, $5, $6)',
        [operatorEmail, 'support', 'DISPUTE_VERDICT_RESOLVED', 'support.dispute.resolve', 'SUCCESS', JSON.stringify({ ticketId, verdict, note })]
      );
    } catch {
      // Non-blocking
    }
    return { success: true, status, ticketId };
  }
}
