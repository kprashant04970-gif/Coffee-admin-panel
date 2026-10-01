import { MachineModel, TankModel } from '@/types';

export class MachineEntity {
  constructor(public data: MachineModel) {}

  get isHotMode(): boolean {
    return this.data.mode === 'HOT';
  }

  get isHealthy(): boolean {
    return this.data.status === 'ONLINE' && !this.data.isLocked;
  }

  get milkFillPercentage(): number {
    if (!this.data.maxMilkLiters) return 0;
    return Math.round((this.data.milkLiters / this.data.maxMilkLiters) * 100);
  }

  get cupsFillPercentage(): number {
    if (!this.data.maxCups) return 0;
    return Math.round((this.data.cupsCount / this.data.maxCups) * 100);
  }

  get isSignalWeak(): boolean {
    return this.data.signalDbm < -85;
  }

  get isTemperatureBreached(): boolean {
    if (this.data.mode === 'HOT') {
      return this.data.temp < 60 || this.data.temp > 72;
    } else {
      return this.data.temp > 8;
    }
  }
}

export class TankEntity {
  constructor(public data: TankModel) {}

  get hoursUntilExpiry(): number {
    const expires = new Date(this.data.expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, (expires - now) / (1000 * 60 * 60));
  }

  get isFssaiCompliant(): boolean {
    return this.hoursUntilExpiry > 0 && this.data.status === 'ACTIVE';
  }
}
