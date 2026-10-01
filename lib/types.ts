export type UserRole = 'owner' | 'ops' | 'support' | 'marketing' | 'finance' | 'viewer';

export interface RolePermission {
  role: UserRole;
  label: string;
  badgeClass: string;
  allowedModules: string[];
  canMutateHardware: boolean;
  canMutateMachines: boolean;
  canApproveRefunds: boolean;
  canAccessFinances: boolean;
  canAccessMarketing: boolean;
  canAccessSecurity: boolean;
  canResolveDisputes: boolean;
  canCreditWallet: boolean;
}

export type ModuleId =
  | 'dashboard'
  | 'machines'
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'analytics'
  | 'marketing'
  | 'support'
  | 'settings'
  | 'architecture';

export interface Machine {
  id: string;
  name: string;
  code: string;
  city: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  mode: 'HOT' | 'COLD';
  temp: number;
  targetTemp: number;
  milkLiters: number;
  maxMilkLiters: number;
  cupsCount: number;
  maxCups?: number;
  kitsCount: number;
  signalDbm: number;
  lastSeen: string;
  isLocked: boolean;
  sdCardFreeMb: number;
  firmwareVersion: string;
  firmwareChecksum: string;
  bootCount: number;
  wdtResets: number;
  camera1Online: boolean;
  camera2Online: boolean;
  activeFaults: string[];
}

export interface Tank {
  id: string;
  machineId: string;
  tankUid: string;
  liters: number;
  maxLiters: number;
  filledAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DISPOSED' | 'RESERVE';
  disposalReason?: string;
  ageHours: number;
}

export interface StockConsumable {
  id: string;
  machineId: string;
  variantId: string;
  variantName: string;
  quantity: number;
  maxCapacity: number;
  reorderThreshold: number;
  lastRefillAt: string;
  lastRefillBy: string;
}

export interface DispenseLog {
  valveOpenMs: number;
  flowPulses: number;
  expectedMl: number;
  dispensedMl: number;
  variancePct: number;
  cupDetected: boolean;
  kitDropped: boolean;
  malaiPumpMs: number;
  conveyorSteps: number;
  windowOpened: boolean;
  pickupDetected: boolean;
}

export interface Order {
  id: string;
  orderNo: string;
  time: string;
  machineId: string;
  machineName: string;
  variant: string;
  amount: number;
  discount: number;
  netAmount: number;
  costBasis: number;
  paymentMethod: 'UPI' | 'Wallet' | 'Cash' | 'Coins';
  status: 'Completed' | 'Preparing' | 'Pending' | 'Cancelled';
  isFlagged: boolean;
  utr: string;
  buyerName: string;
  buyerPhone: string;
  buyerId?: string;
  qrSource: 'Purchase' | 'Ad Reward' | 'Referral' | 'Gift';
  qrShareCount: number;
  qrExpiry: string;
  dispenseLog: DispenseLog;
  tankUid: string;
  tankAgeHours: number;
  hasDispute: boolean;
  disputeTicketId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  ordersCount: number;
  totalSpend: number;
  lastOrder: string;
  walletBalance: number;
  coins: number;
  streak: number;
  longestStreak: number;
  favoriteVariant: string;
  segment: 'Active Today' | 'Active This Week' | 'Lapsed 7d' | 'Lapsed 30d' | 'High Value';
  leaderboardOptIn: boolean;
  city: string;
  collegeOrWork: string;
  isBlocked: boolean;
}

export interface WalletTransaction {
  id: string;
  customerId: string;
  timestamp: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId: string;
}

export interface SupportTicket {
  id: string;
  ticketNo: string;
  orderId: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  machineId: string;
  machineName: string;
  claimedAt: string;
  amount: number;
  utr: string;
  reason: 'no_coffee' | 'no_kit' | 'cup_stuck' | 'payment_deducted' | 'quality' | 'spill' | 'other';
  reasonLabel: string;
  status: 'OPEN' | 'CLAIMED' | 'RESOLVED_REFUND' | 'RESOLVED_REJECTED' | 'ESCALATED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  slaRemainingMinutes: number;
  channel: 'Bot' | 'WhatsApp' | 'Manual';
  customerMessage: string;
  dispenseVariance: number;
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  clipUrl?: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  type: 'FLAT' | 'PERCENT' | 'FREE_ITEM';
  value: number;
  minOrder: number;
  usageCount: number;
  maxUsage: number;
  budgetCap: number;
  budgetBurned: number;
  expiresAt: string;
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
}

export interface AppBanner {
  id: string;
  title: string;
  placement: 'Home Carousel' | 'Splash Screen' | 'QR Success' | 'Wallet Screen';
  impressions: number;
  clicks: number;
  priority: number;
  status: 'ACTIVE' | 'SCHEDULED' | 'INACTIVE';
  previewColor: string;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  targetSegment: string;
  sentAt: string;
  delivered: number;
  opened: number;
  openRate: number;
}

export interface AdSpaceBooking {
  id: string;
  machineId: string;
  machineName: string;
  slotName: 'Side Panel' | 'Front Fascia' | 'Idle Display' | 'Cup Print';
  advertiser: string;
  rateMonthly: number;
  monthsBooked: number;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  renewalDate: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  adminName: string;
  role: UserRole;
  action: string;
  target: string;
  details: string;
}
