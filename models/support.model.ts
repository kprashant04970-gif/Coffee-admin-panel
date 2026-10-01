import { TicketModel, EvidenceBundleModel } from '@/types';

export class TicketEntity {
  constructor(public data: TicketModel) {}

  get isUrgentBreachRisk(): boolean {
    return this.data.slaRemainingMinutes <= 5 && this.data.status === 'OPEN';
  }

  get isVarianceHigh(): boolean {
    return Math.abs(this.data.dispenseVariance) > 15;
  }
}

export class EvidenceBundleEntity {
  constructor(public data: EvidenceBundleModel) {}

  get isAutoRefundRecommended(): boolean {
    return this.data.varianceWarning || this.data.dispenseLog.variancePct > 15;
  }
}
