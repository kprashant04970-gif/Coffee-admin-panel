import { OrderModel, DispenseLogModel } from '@/types';

export class OrderEntity {
  constructor(public data: OrderModel) {}

  get grossMarginPercentage(): number {
    if (!this.data.netAmount) return 0;
    const profit = this.data.netAmount - this.data.costBasis;
    return Math.round((profit / this.data.netAmount) * 100);
  }

  get isFlaggedDispute(): boolean {
    return this.data.isFlagged;
  }
}

export class DispenseLogEntity {
  constructor(public data: DispenseLogModel) {}

  get isDispenseFailed(): boolean {
    return (
      Math.abs(this.data.variancePct) > 15 ||
      !this.data.cupDetected ||
      !this.data.kitDropped
    );
  }

  get telemetrySummary(): string {
    return `${this.data.dispensedMl}ml dispensed (expected ${this.data.expectedMl}ml, ${this.data.variancePct}% var, ${this.data.flowPulses} pulses)`;
  }
}
