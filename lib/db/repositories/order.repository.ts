import { supabase } from '../client';
import { Database } from '@/types/database';

export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type DispenseLogRow = Database['public']['Tables']['dispense_logs']['Row'];

export class OrderRepository {
  public static async getById(id: string): Promise<OrderRow | null> {
    const { data } = await (supabase.from('orders') as any).select('*').eq('id', id).single();
    return data as OrderRow | null;
  }

  public static async recordDispenseTelemetry(log: Database['public']['Tables']['dispense_logs']['Insert']): Promise<void> {
    await (supabase.from('dispense_logs') as any).insert(log);
  }

  public static async recordPayment(payment: Database['public']['Tables']['payment_transactions']['Insert']): Promise<void> {
    await (supabase.from('payment_transactions') as any).insert(payment);
  }
}
