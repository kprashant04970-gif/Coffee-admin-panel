import { db } from '../client';
import { Database } from '@/types/database';

export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type DispenseLogRow = Database['public']['Tables']['dispense_logs']['Row'];

export class OrderRepository {
  public static async getById(id: string): Promise<OrderRow | null> {
    db.from('orders').select();
    return null;
  }

  public static async recordDispenseTelemetry(log: Database['public']['Tables']['dispense_logs']['Insert']): Promise<void> {
    db.from('dispense_logs').insert(log);
  }

  public static async recordPayment(payment: Database['public']['Tables']['payment_transactions']['Insert']): Promise<void> {
    db.from('payment_transactions').insert(payment);
  }
}
