/**
 * Manhattan Coffee Vending Network — Core Domain Models
 * File: types/models.ts
 */

import {
  MachineStatus,
  MachineMode,
  TankStatus,
  OrderStatus,
  PaymentMethod,
  TicketStatus,
  TicketPriority,
  UserRole,
} from './database';

export interface MachineModel {
  id: string;
  code: string;
  name: string;
  city: string;
  location: string;
  latitude?: number;
  longitude?: number;
  status: MachineStatus;
  mode: MachineMode;
  temp: number;
  targetTemp: number;
  milkLiters: number;
  maxMilkLiters: number;
  cupsCount: number;
  maxCups: number;
  kitsCount: number;
  signalDbm: number;
  isLocked: boolean;
  sdCardFreeMb: number;
  firmwareVersion: string;
  firmwareChecksum: string;
  bootCount: number;
  wdtResets: number;
  lastPingAt: string;
}

export interface TankModel {
  id: string;
  machineId: string;
  tankUid: string;
  liters: number;
  maxLiters: number;
  filledAt: string;
  expiresAt: string;
  status: TankStatus;
  disposalReason?: string;
}

export interface OrderModel {
  id: string;
  orderNo: string;
  machineId: string;
  machineName: string;
  productId?: string;
  variant: string;
  amount: number;
  discount: number;
  netAmount: number;
  costBasis: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  isFlagged: boolean;
  utr?: string;
  buyerId?: string;
  buyerName: string;
  buyerPhone: string;
  tankUid?: string;
  orderedAt: string;
}

export interface DispenseLogModel {
  id: string;
  orderId: string;
  valveOpenMs: number;
  flowPulses: number;
  expectedMl: number;
  dispensedMl: number;
  variancePct: number;
  cupDetected: boolean;
  kitDropped: boolean;
  malaiPumpMs?: number;
  conveyorSteps?: number;
  windowOpened: boolean;
  pickupDetected: boolean;
  loggedAt: string;
}

export interface CustomerModel {
  id: string;
  phone: string;
  fullName: string;
  avatarInitials: string;
  city: string;
  collegeOrWork?: string;
  segment: string;
  isBlocked: boolean;
  ordersCount: number;
  totalSpend: number;
  currentStreak: number;
  longestStreak: number;
  favoriteVariant: string;
  createdAt: string;
}

export interface WalletModel {
  id: string;
  userId: string;
  balance: number;
  coinBalance: number;
  currency: string;
}

export interface TicketModel {
  id: string;
  ticketNo: string;
  orderId: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  machineId: string;
  machineName: string;
  amount: number;
  utr?: string;
  reason: string;
  reasonLabel: string;
  status: TicketStatus;
  priority: TicketPriority;
  slaRemainingMinutes: number;
  slaDeadline: string;
  channel: string;
  customerMessage: string;
  dispenseVariance: number;
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface EvidenceBundleModel {
  ticket: TicketModel;
  order: OrderModel;
  dispenseLog: DispenseLogModel;
  tankAtPour?: TankModel;
  healthWindow10m: Array<{
    faultCode: string;
    severity: string;
    description: string;
    occurredAt: string;
  }>;
  videoClips: Array<{
    channel: number;
    clipUrl: string;
    durationSecs: number;
  }>;
  customerContext: {
    profile: CustomerModel;
    recentOrders: Array<Partial<OrderModel>>;
  };
  varianceWarning: boolean;
}

export interface CouponModel {
  id: string;
  code: string;
  title: string;
  type: string;
  value: number;
  minOrder: number;
  usageCount: number;
  maxUsage: number;
  budgetCap: number;
  budgetBurned: number;
  status: string;
  expiresAt: string;
}

export interface BannerModel {
  id: string;
  title: string;
  placement: string;
  impressions: number;
  clicks: number;
  priority: number;
  status: string;
  imageUrl?: string;
}

export interface AdminUserModel {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  mfaEnabled: boolean;
  isSuspended: boolean;
  lastLoginAt?: string;
}

export interface AuditLogModel {
  id: string;
  adminId?: string;
  adminName: string;
  role: UserRole;
  action: string;
  target: string;
  details: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}
