/**
 * Manhattan Coffee — Marketing, Coupons & Ads Repository (PostgreSQL Native)
 * File: lib/db/repositories/marketing.repository.ts
 */

import { query } from '../client';
import { INITIAL_COUPONS, INITIAL_BANNERS, INITIAL_AD_SPACES } from '@/lib/mock-data';

export interface CouponRecord {
  id: string;
  code: string;
  title: string;
  discount_type: 'FLAT' | 'PERCENT' | 'FREE_ITEM';
  discount_value: number;
  budget_inr: number;
  spent_inr: number;
  redemptions_count: number;
  is_active: boolean;
}

export class MarketingRepository {
  public static async getCoupons(): Promise<CouponRecord[]> {
    try {
      const res = await query<CouponRecord>('SELECT * FROM coupons ORDER BY code ASC');
      if (res.rows.length > 0) return res.rows;
    } catch {
      // Fallback
    }
    return INITIAL_COUPONS.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      discount_type: c.type,
      discount_value: c.value,
      budget_inr: c.budgetCap,
      spent_inr: c.budgetBurned,
      redemptions_count: c.usageCount,
      is_active: c.status === 'ACTIVE',
    }));
  }

  public static async createCoupon(
    coupon: Omit<CouponRecord, 'id' | 'spent_inr' | 'redemptions_count' | 'is_active'>,
    operatorEmail: string
  ): Promise<CouponRecord> {
    const id = `CPN-${Date.now().toString().slice(-4)}`;
    try {
      await query(
        `INSERT INTO coupons (id, code, title, discount_type, discount_value, budget_inr, spent_inr, redemptions_count, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, 0.0, 0, TRUE)`,
        [id, coupon.code.toUpperCase(), coupon.title, coupon.discount_type, coupon.discount_value, coupon.budget_inr]
      );
      await query(
        'INSERT INTO audit_logs (user_id, user_role, action, permission, status, details) VALUES ($1, $2, $3, $4, $5, $6)',
        [operatorEmail, 'marketing', 'COUPON_CREATED', 'marketing.campaign.publish', 'SUCCESS', JSON.stringify({ code: coupon.code, budget: coupon.budget_inr })]
      );
    } catch (err) {
      console.warn('[MarketingRepository] Fallback create coupon:', err);
    }
    return {
      id,
      code: coupon.code.toUpperCase(),
      title: coupon.title,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      budget_inr: coupon.budget_inr,
      spent_inr: 0,
      redemptions_count: 0,
      is_active: true,
    };
  }

  public static async toggleCoupon(id: string, active: boolean): Promise<void> {
    try {
      await query('UPDATE coupons SET is_active = $1 WHERE id = $2', [active, id]);
    } catch (err) {
      console.warn('[MarketingRepository] Fallback toggle coupon:', err);
    }
  }

  public static async getAdSpaces(): Promise<any[]> {
    try {
      const res = await query('SELECT * FROM ad_space_bookings');
      if (res.rows.length > 0) return res.rows;
    } catch {
      // Fallback
    }
    return INITIAL_AD_SPACES;
  }

  public static async getBanners(): Promise<any[]> {
    try {
      const res = await query('SELECT * FROM app_banners WHERE is_active = TRUE ORDER BY order_index ASC');
      if (res.rows.length > 0) return res.rows;
    } catch {
      // Fallback
    }
    return INITIAL_BANNERS;
  }
}
