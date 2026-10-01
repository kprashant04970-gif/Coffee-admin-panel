import { supabase } from '../client';
import { Database } from '@/types/database';

export type MachineRow = Database['public']['Tables']['machines']['Row'];
export type MachineInsert = Database['public']['Tables']['machines']['Insert'];
export type MachineUpdate = Database['public']['Tables']['machines']['Update'];

export class MachineRepository {
  public static async getById(id: string): Promise<MachineRow | null> {
    const { data } = await (supabase.from('machines') as any).select('*').eq('id', id).single();
    return data as MachineRow | null;
  }

  public static async updateHardwareState(id: string, updates: MachineUpdate): Promise<void> {
    await (supabase.from('machines') as any).update(updates).eq('id', id);
  }

  public static async logTelemetry(telemetry: Database['public']['Tables']['machine_telemetry']['Insert']): Promise<void> {
    await (supabase.from('machine_telemetry') as any).insert(telemetry);
  }

  public static async logCleaningCycle(cycle: Database['public']['Tables']['machine_cleaning_cycles']['Insert']): Promise<void> {
    await (supabase.from('machine_cleaning_cycles') as any).insert(cycle);
  }
}
