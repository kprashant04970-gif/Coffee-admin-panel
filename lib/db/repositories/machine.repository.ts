import { db } from '../client';
import { Database } from '@/types/database';

export type MachineRow = Database['public']['Tables']['machines']['Row'];
export type MachineInsert = Database['public']['Tables']['machines']['Insert'];
export type MachineUpdate = Database['public']['Tables']['machines']['Update'];

export class MachineRepository {
  public static async getById(id: string): Promise<MachineRow | null> {
    // Queries machine table
    db.from('machines').select();
    return null;
  }

  public static async updateHardwareState(id: string, updates: MachineUpdate): Promise<void> {
    db.from('machines').update(updates);
  }

  public static async logTelemetry(telemetry: Database['public']['Tables']['machine_telemetry']['Insert']): Promise<void> {
    db.from('machine_telemetry').insert(telemetry);
  }

  public static async logCleaningCycle(cycle: Database['public']['Tables']['machine_cleaning_cycles']['Insert']): Promise<void> {
    db.from('machine_cleaning_cycles').insert(cycle);
  }
}
