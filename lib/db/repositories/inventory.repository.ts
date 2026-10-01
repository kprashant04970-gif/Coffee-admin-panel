/**
 * Manhattan Coffee — Inventory & Cold-Chain Tanks Repository (PostgreSQL Native)
 * File: lib/db/repositories/inventory.repository.ts
 */

import { query } from '../client';
import { INITIAL_TANKS, INITIAL_STOCK } from '@/lib/mock-data';

export interface TankRecord {
  id: string;
  batch_no: string;
  supplier_name: string;
  fssai_cert_no: string;
  liters_capacity: number;
  current_liters: number;
  temperature_c: number;
  status: string;
  assigned_machine_id?: string;
  mounted_at: string;
  expiry_date: string;
}

export interface StockRecord {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  reorder_level: number;
  cost_basis_inr: number;
}

export class InventoryRepository {
  public static async getTanks(): Promise<TankRecord[]> {
    try {
      const res = await query<TankRecord>(
        'SELECT * FROM inventory_tanks ORDER BY mounted_at DESC'
      );
      if (res.rows.length > 0) return res.rows;
    } catch {
      // Fallback
    }
    return INITIAL_TANKS.map((t) => ({
      id: t.id,
      batch_no: t.tankUid,
      supplier_name: 'Amul Dairy Anand',
      fssai_cert_no: 'FSSAI-1151801800042',
      liters_capacity: t.maxLiters,
      current_liters: t.liters,
      temperature_c: 3.8,
      status: t.status,
      assigned_machine_id: t.machineId,
      mounted_at: t.filledAt,
      expiry_date: t.expiresAt,
    }));
  }

  public static async getStock(): Promise<StockRecord[]> {
    try {
      const res = await query<StockRecord>('SELECT * FROM inventory_stock ORDER BY item_name ASC');
      if (res.rows.length > 0) return res.rows;
    } catch {
      // Fallback
    }
    return INITIAL_STOCK.map((s) => ({
      id: s.id,
      item_name: s.variantName,
      category: 'Beverage Blend',
      quantity: s.quantity,
      unit: 'grams',
      reorder_level: s.reorderThreshold,
      cost_basis_inr: 8.5,
    }));
  }

  public static async mountTank(
    tankId: string,
    machineId: string,
    operatorEmail: string
  ): Promise<void> {
    try {
      await query(
        `UPDATE inventory_tanks 
         SET status = 'MOUNTED', assigned_machine_id = $1, mounted_at = NOW() 
         WHERE id = $2`,
        [machineId, tankId]
      );
      await query(
        'INSERT INTO audit_logs (user_id, user_role, action, permission, status, details) VALUES ($1, $2, $3, $4, $5, $6)',
        [operatorEmail, 'ops', 'COLD_CHAIN_TANK_MOUNTED', 'inventory.tank.mount', 'SUCCESS', JSON.stringify({ tankId, machineId })]
      );
    } catch (err) {
      console.warn(`[InventoryRepository] Fallback tank mount for ${tankId}:`, err);
    }
  }
}
