import { CustomerModel, WalletModel } from '@/types';

export class CustomerEntity {
  constructor(public data: CustomerModel) {}

  get isHighValue(): boolean {
    return this.data.totalSpend > 1000 || this.data.ordersCount > 20;
  }

  get isAtRisk(): boolean {
    return this.data.currentStreak === 0 && this.data.longestStreak > 5;
  }
}

export class WalletEntity {
  constructor(public data: WalletModel) {}

  get formattedBalance(): string {
    return `₹${this.data.balance.toFixed(2)}`;
  }

  canAfford(amount: number): boolean {
    return this.data.balance >= amount;
  }
}
