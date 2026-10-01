import { CouponModel, BannerModel } from '@/types';

export class CouponEntity {
  constructor(public data: CouponModel) {}

  get budgetUtilizationPct(): number {
    if (!this.data.budgetCap) return 0;
    return Math.round((this.data.budgetBurned / this.data.budgetCap) * 100);
  }

  get isBudgetExhausted(): boolean {
    return this.data.budgetBurned >= this.data.budgetCap;
  }
}

export class BannerEntity {
  constructor(public data: BannerModel) {}

  get ctrPercentage(): number {
    if (!this.data.impressions) return 0;
    return parseFloat(((this.data.clicks / this.data.impressions) * 100).toFixed(2));
  }
}
