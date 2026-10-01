'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  ModuleId,
  Machine,
  Tank,
  StockConsumable,
  Order,
  Customer,
  SupportTicket,
  Coupon,
  AppBanner,
  PushNotification,
  AdSpaceBooking,
  AuditLogItem,
} from './types';
import {
  ROLE_PERMISSIONS,
  INITIAL_MACHINES,
  INITIAL_TANKS,
  INITIAL_STOCK,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_TICKETS,
  INITIAL_COUPONS,
  INITIAL_BANNERS,
  INITIAL_PUSH_NOTIFICATIONS,
  INITIAL_AD_SPACES,
  INITIAL_AUDIT_LOGS,
} from './mock-data';

interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'fault' | 'ticket' | 'stock' | 'system';
  targetModule: ModuleId;
  targetId?: string;
  read: boolean;
}

interface AdminContextType {
  role: UserRole;
  setRole: (r: UserRole) => void;
  // Display, Themes & Accessibility
  themeMode: 'light' | 'dark' | 'auto';
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => void;
  resolvedTheme: 'light' | 'dark';
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  compactDensity: boolean;
  setCompactDensity: (enabled: boolean) => void;

  module: ModuleId;
  setModule: (m: ModuleId) => void;
  // Subview deep links
  selectedMachineId: string | null;
  setSelectedMachineId: (id: string | null) => void;
  machineActiveTab: string;
  setMachineActiveTab: (tab: string) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  orderStubOpen: boolean;
  setOrderStubOpen: (open: boolean) => void;

  // Global search & filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  dateRange: 'Today' | 'This Week' | 'This Month';
  setDateRange: (r: 'Today' | 'This Week' | 'This Month') => void;

  // Real data state
  machines: Machine[];
  tanks: Tank[];
  stock: StockConsumable[];
  orders: Order[];
  customers: Customer[];
  tickets: SupportTicket[];
  coupons: Coupon[];
  banners: AppBanner[];
  pushNotifications: PushNotification[];
  adSpaces: AdSpaceBooking[];
  auditLogs: AuditLogItem[];

  // Mutations
  lockMachine: (id: string) => void;
  unlockMachine: (id: string) => void;
  rebootMachine: (id: string) => void;
  testDispense: (id: string) => void;
  setTargetTemp: (id: string, temp: number) => void;
  setMachineMode: (id: string, mode: 'HOT' | 'COLD') => void;
  mountTank: (machineId: string, liters: number, uid: string) => void;
  refillStock: (machineId: string, variantName: string, amount: number) => void;
  addNewMachine: (name: string, location: string, mode: 'HOT' | 'COLD') => void;

  resolveDispute: (
    ticketId: string,
    verdict: 'APPROVE_REFUND' | 'REJECT' | 'REQUEST_INFO' | 'BLACKLIST',
    note: string
  ) => void;
  refundOrder: (orderId: string, reason: string) => void;
  markOrderFraud: (orderId: string) => void;
  openDisputeForOrder: (orderId: string) => void;

  creditWallet: (customerId: string, amount: number, note: string) => void;
  toggleBlockCustomer: (customerId: string) => void;
  sendPushNotification: (title: string, body: string, segment: string) => void;
  createCoupon: (code: string, title: string, type: 'FLAT' | 'PERCENT', value: number, budget: number) => void;
  toggleCouponStatus: (id: string) => void;
  toggleMasterMode: (mode: 'HOT' | 'COLD') => void;

  // Navigation helpers
  navigateToMachine: (machineId: string, tab?: string) => void;
  navigateToOrder: (orderId: string) => void;
  navigateToTicket: (ticketId: string) => void;
  navigateToCustomer: (customerId: string) => void;

  // Notifications & Toasts
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  toasts: ToastItem[];
  toast: (msg: string, type?: 'info' | 'success' | 'warn' | 'error') => void;
  dismissToast: (id: string) => void;

  // Real-time ticker
  lastSyncSecs: number;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('owner');
  const [module, setModuleState] = useState<ModuleId>('dashboard');

  // Display, Themes & Accessibility State (Lazy Initialized from localStorage)
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'auto'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mc_theme_mode');
        if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
      } catch {
        // ignore
      }
    }
    return 'auto';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('mc_high_contrast') === 'true';
      } catch {
        // ignore
      }
    }
    return false;
  });

  const [compactDensity, setCompactDensityState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('mc_compact_density') === 'true';
      } catch {
        // ignore
      }
    }
    return false;
  });

  // Derived effective theme (avoids synchronous setState in effects)
  const resolvedTheme: 'light' | 'dark' =
    themeMode === 'auto' ? (systemPrefersDark ? 'dark' : 'light') : themeMode;

  // Listen to OS theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  // Update HTML DOM classes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.classList.toggle('high-contrast', highContrast);
    root.classList.toggle('compact-density', compactDensity);
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme, highContrast, compactDensity]);

  const setThemeMode = (mode: 'light' | 'dark' | 'auto') => {
    setThemeModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mc_theme_mode', mode);
    }
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mc_high_contrast', String(enabled));
    }
  };

  const setCompactDensity = (enabled: boolean) => {
    setCompactDensityState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mc_compact_density', String(enabled));
    }
  };

  const [selectedMachineId, setSelectedMachineId] = useState<string | null>('MCH-001');
  const [machineActiveTab, setMachineActiveTab] = useState<string>('overview');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>('TKT-8902');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>('CUS-401');
  const [orderStubOpen, setOrderStubOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'Today' | 'This Week' | 'This Month'>('Today');

  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [tanks, setTanks] = useState<Tank[]>(INITIAL_TANKS);
  const [stock, setStock] = useState<StockConsumable[]>(INITIAL_STOCK);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [banners, setBanners] = useState<AppBanner[]>(INITIAL_BANNERS);
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>(INITIAL_PUSH_NOTIFICATIONS);
  const [adSpaces, setAdSpaces] = useState<AdSpaceBooking[]>(INITIAL_AD_SPACES);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: '🚨 SLA Warning: 4 mins remaining',
      description: 'Ticket TKT-8902 (#ORD-9842) variance 18.3% needs resolution.',
      time: '2m ago',
      type: 'ticket',
      targetModule: 'support',
      targetId: 'TKT-8902',
      read: false,
    },
    {
      id: 'notif-2',
      title: '⚠️ Low Milk Buffer at Mall Lane',
      description: 'MCH-002 tank has 21L remaining. Estimated refill needed in 2h.',
      time: '14m ago',
      type: 'stock',
      targetModule: 'machines',
      targetId: 'MCH-002',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'FSSAI Tank TNK-901 mounted',
      description: 'Tech Suresh K. certified batch TNK-901 active on Campus Hub.',
      time: '6h ago',
      type: 'system',
      targetModule: 'inventory',
      targetId: 'TNK-901',
      read: true,
    },
  ]);

  const [lastSyncSecs, setLastSyncSecs] = useState(0);

  // 8-second Live Telemetry Polling (Replaces Supabase Realtime for VPS deployment)
  useEffect(() => {
    let active = true;

    const pollLiveEndpoints = async () => {
      try {
        const res = await fetch('/api/live/dashboard');
        if (active && res.ok) {
          setLastSyncSecs(0);
        }
      } catch {
        // Non-blocking network fallback
      }
    };

    const timer = setInterval(() => {
      setLastSyncSecs((s) => s + 8);
      pollLiveEndpoints();
    }, 8000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const toast = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const appendAuditLog = (action: string, target: string, details: string) => {
    const newLog: AuditLogItem = {
      id: 'AUD-' + Math.floor(100 + Math.random() * 900),
      timestamp: 'Just now',
      adminName: role === 'owner' ? 'Chief Rohan' : `Admin (${role.toUpperCase()})`,
      role,
      action,
      target,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    toast(`Active persona switched to: ${ROLE_PERMISSIONS[newRole].label}`, 'info');
    appendAuditLog('ROLE_SWITCH', `Self`, `Switched active role to ${newRole}`);
  };

  const setModule = (newModule: ModuleId) => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.allowedModules.includes(newModule)) {
      toast(`Access Denied: Role '${role}' lacks permission for '${newModule}' module`, 'error');
      return;
    }
    setModuleState(newModule);
  };

  // Navigations with context
  const navigateToMachine = (machineId: string, tab: string = 'overview') => {
    setSelectedMachineId(machineId);
    setMachineActiveTab(tab);
    setModuleState('machines');
  };

  const navigateToOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModuleState('orders');
  };

  const navigateToTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setModuleState('support');
  };

  const navigateToCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setModuleState('customers');
  };

  // Machine controls
  const lockMachine = (id: string) => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canMutateMachines) {
      toast(`Permission Denied: '${role}' cannot lock hardware. Required: ops or owner`, 'error');
      return;
    }
    setMachines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isLocked: true } : m))
    );
    toast(`Safety Lock engaged for ${id}. Machine dispensing disabled.`, 'warn');
    appendAuditLog('MACHINE_LOCKED', id, 'Emergency hardware safety lock engaged.');
  };

  const unlockMachine = (id: string) => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canMutateMachines) {
      toast(`Permission Denied: '${role}' cannot unlock hardware.`, 'error');
      return;
    }
    setMachines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isLocked: false } : m))
    );
    toast(`Safety Lock disengaged for ${id}. Machine ready.`, 'success');
    appendAuditLog('MACHINE_UNLOCKED', id, 'Safety lock removed.');
  };

  const rebootMachine = (id: string) => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canMutateMachines) {
      toast(`Permission Denied: '${role}' cannot reboot machine.`, 'error');
      return;
    }
    toast(`Sending cold restart command to ${id} ESP32 controller...`, 'info');
    setTimeout(() => {
      setMachines((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, bootCount: m.bootCount + 1, lastSeen: 'just now', status: 'ONLINE' }
            : m
        )
      );
      toast(`Machine ${id} rebooted cleanly (WDT 0, Sensors OK).`, 'success');
      appendAuditLog('MACHINE_REBOOTED', id, 'Remote cold reboot via MQTT/TLS.');
    }, 1200);
  };

  const testDispense = (id: string) => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canMutateMachines) {
      toast(`Permission Denied: '${role}' cannot trigger test dispense.`, 'error');
      return;
    }
    toast(`Executing 20ml calibration test on ${id}...`, 'info');
    setTimeout(() => {
      toast(`Test dispense passed! 20.2ml measured (0.8% variance). Flow sensor nominal.`, 'success');
      appendAuditLog('TEST_DISPENSE', id, '20ml test calibration pour completed with 0.8% variance.');
    }, 1500);
  };

  const setTargetTemp = (id: string, temp: number) => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canMutateMachines) {
      toast(`Permission Denied: '${role}' cannot update temperature target.`, 'error');
      return;
    }
    setMachines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, targetTemp: temp } : m))
    );
    toast(`Target temperature updated to ${temp.toFixed(1)}°C on ${id}`, 'success');
    appendAuditLog('TEMP_UPDATED', id, `Target boiler/chiller temp set to ${temp}°C`);
  };

  const setMachineMode = (id: string, mode: 'HOT' | 'COLD') => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canMutateMachines) {
      toast(`Permission Denied: '${role}' cannot toggle machine mode.`, 'error');
      return;
    }
    setMachines((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              mode,
              targetTemp: mode === 'HOT' ? 66.0 : 6.0,
              temp: mode === 'HOT' ? 64.8 : 6.5,
            }
          : m
      )
    );
    toast(`Machine ${id} switched to ${mode} mode (Boiler/Chiller adjusted)`, 'success');
    appendAuditLog('MODE_CHANGED', id, `Switched fleet mode to ${mode}`);
  };

  const mountTank = (machineId: string, liters: number, uid: string) => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canMutateMachines) {
      toast(`Permission Denied: '${role}' cannot mount milk tank. Required: ops or owner`, 'error');
      return;
    }
    const newTank: Tank = {
      id: 'TNK-' + Math.floor(900 + Math.random() * 99),
      machineId,
      tankUid: uid || `FSSAI-MH-2026-${Math.floor(100 + Math.random() * 900)}`,
      liters,
      maxLiters: 45,
      filledAt: 'Just now',
      expiresAt: 'In 18 hours (FSSAI 18h hold rule)',
      status: 'ACTIVE',
      ageHours: 0.1,
    };
    setTanks((prev) => [newTank, ...prev]);
    setMachines((prev) =>
      prev.map((m) =>
        m.id === machineId
          ? { ...m, milkLiters: liters, activeFaults: m.activeFaults.filter((f) => f !== 'LOW_MILK_BUFFER') }
          : m
      )
    );
    toast(`Tank ${newTank.tankUid} (${liters}L) successfully mounted on ${machineId}`, 'success');
    appendAuditLog('TANK_MOUNTED', machineId, `Mounted ${liters}L tank ${newTank.tankUid}`);
  };

  const refillStock = (machineId: string, variantName: string, amount: number) => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canMutateMachines) {
      toast(`Permission Denied: '${role}' cannot log stock refills.`, 'error');
      return;
    }
    setStock((prev) =>
      prev.map((item) =>
        item.machineId === machineId && item.variantName === variantName
          ? {
              ...item,
              quantity: Math.min(item.maxCapacity, item.quantity + amount),
              lastRefillAt: 'Just now',
              lastRefillBy: role === 'owner' ? 'Chief Rohan' : 'Tech Operator',
            }
          : item
      )
    );
    toast(`Refilled ${amount} kits of ${variantName} on ${machineId}`, 'success');
    appendAuditLog('STOCK_REFILLED', machineId, `Refilled +${amount} kits of ${variantName}`);
  };

  const addNewMachine = (name: string, location: string, mode: 'HOT' | 'COLD') => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canMutateMachines) {
      toast(`Permission Denied: Only ops or owner can commission new machines.`, 'error');
      return;
    }
    const newCode = `MCH-00${machines.length + 1}`;
    const newMach: Machine = {
      id: newCode,
      name,
      code: newCode,
      city: 'Mumbai',
      location,
      status: 'ONLINE',
      mode,
      temp: mode === 'HOT' ? 65.0 : 6.0,
      targetTemp: mode === 'HOT' ? 66.0 : 6.0,
      milkLiters: 40,
      maxMilkLiters: 45,
      cupsCount: 150,
      kitsCount: 180,
      signalDbm: -65,
      lastSeen: 'just now',
      isLocked: false,
      sdCardFreeMb: 28000,
      firmwareVersion: 'v2.4.1-rc3',
      firmwareChecksum: '9a4c8e71b2f09d8e',
      bootCount: 1,
      wdtResets: 0,
      camera1Online: true,
      camera2Online: true,
      activeFaults: [],
    };
    setMachines((prev) => [...prev, newMach]);
    toast(`New machine ${newCode} (${name}) onboarded and synced to fleet!`, 'success');
    appendAuditLog('MACHINE_COMMISSIONED', newCode, `Added new unit at ${location}`);
  };

  // Support & Dispute desk actions
  const resolveDispute = (
    ticketId: string,
    verdict: 'APPROVE_REFUND' | 'REJECT' | 'REQUEST_INFO' | 'BLACKLIST',
    note: string
  ) => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canResolveDisputes) {
      toast(`Permission Denied: '${role}' cannot take dispute verdicts.`, 'error');
      return;
    }

    if (verdict === 'APPROVE_REFUND' && !perm.canApproveRefunds) {
      toast(
        `Restricted Workflow: Support agents cannot authorize cash refunds directly. Escalate to Ops or Finance for payout authorization.`,
        'warn'
      );
      // Change status to ESCALATED
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: 'ESCALATED',
                resolution: `Support verified legitimacy (variance ${t.dispenseVariance}%). Payout forwarded to Finance/Ops approval queue. Note: ${note}`,
                resolvedAt: 'Pending Finance payout',
                resolvedBy: 'Support Desk Agent',
              }
            : t
        )
      );
      appendAuditLog('DISPUTE_ESCALATED', ticketId, 'Escalated to Finance for payout approval.');
      return;
    }

    if (verdict === 'APPROVE_REFUND') {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket) {
        // Refund order
        setOrders((prev) =>
          prev.map((o) => (o.id === ticket.orderId ? { ...o, status: 'Cancelled' } : o))
        );
      }
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: 'RESOLVED_REFUND',
                resolution: note || 'Refund approved based on telemetry variance and camera check.',
                resolvedAt: 'Just now',
                resolvedBy: role === 'owner' ? 'Chief Rohan' : `Admin (${role})`,
              }
            : t
        )
      );
      toast(`Dispute ${ticketId} resolved: Full refund initiated to UPI source.`, 'success');
      appendAuditLog('DISPUTE_RESOLVED_REFUND', ticketId, note || 'Approved refund on dispute desk.');
    } else if (verdict === 'REJECT') {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: 'RESOLVED_REJECTED',
                resolution: note || 'Rejected with camera and sensor proof link sent to customer.',
                resolvedAt: 'Just now',
                resolvedBy: role === 'owner' ? 'Chief Rohan' : `Admin (${role})`,
              }
            : t
        )
      );
      toast(`Dispute ${ticketId} rejected with proof. Customer notified.`, 'info');
      appendAuditLog('DISPUTE_REJECTED', ticketId, note || 'Rejected with video clip evidence.');
    } else if (verdict === 'BLACKLIST') {
      if (role !== 'owner') {
        toast(`Permission Denied: Only Owner can add users to the Fraud Blacklist.`, 'error');
        return;
      }
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === ticket.customerId ? { ...c, isBlocked: true } : c))
        );
      }
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: 'RESOLVED_REJECTED',
                resolution: 'Fraud pattern confirmed. Customer blacklisted.',
                resolvedAt: 'Just now',
                resolvedBy: 'Chief Rohan',
              }
            : t
        )
      );
      toast(`Customer blacklisted for repeated fraudulent claims.`, 'error');
      appendAuditLog('CUSTOMER_BLACKLISTED', ticketId, 'Added device/phone to permanent blacklist.');
    }
  };

  const refundOrder = (orderId: string, reason: string) => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canApproveRefunds) {
      toast(`Permission Denied: '${role}' cannot authorize financial refunds.`, 'error');
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o))
    );
    toast(`Order ${orderId} refunded: ₹ amount reversed. Reason: ${reason}`, 'success');
    appendAuditLog('ORDER_REFUNDED', orderId, reason);
  };

  const markOrderFraud = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, isFlagged: true } : o))
    );
    toast(`Order ${orderId} flagged for fraud audit investigation.`, 'warn');
    appendAuditLog('ORDER_FLAGGED_FRAUD', orderId, 'Flagged by admin');
  };

  const openDisputeForOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    // Check if ticket already exists
    const existing = tickets.find((t) => t.orderId === orderId);
    if (existing) {
      navigateToTicket(existing.id);
      toast(`Opening existing dispute ticket ${existing.id}`, 'info');
      return;
    }
    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(8900 + Math.random() * 99)}`,
      ticketNo: `TKT-${Math.floor(8900 + Math.random() * 99)}`,
      orderId: order.id,
      orderNo: order.orderNo,
      customerId: order.buyerId || 'CUS-401',
      customerName: order.buyerName,
      customerPhone: order.buyerPhone,
      machineId: order.machineId,
      machineName: order.machineName,
      claimedAt: 'Just now',
      amount: order.netAmount,
      utr: order.utr,
      reason: 'quality',
      reasonLabel: 'Manual dispute raised by operator',
      status: 'OPEN',
      priority: 'MEDIUM',
      slaRemainingMinutes: 15,
      channel: 'Manual',
      customerMessage: `Operator flagged dispense for review: variance ${order.dispenseLog.variancePct}%.`,
      dispenseVariance: order.dispenseLog.variancePct,
    };
    setTickets((prev) => [newTicket, ...prev]);
    navigateToTicket(newTicket.id);
    toast(`Dispute ticket ${newTicket.id} created for order ${order.orderNo}`, 'success');
  };

  const creditWallet = (customerId: string, amount: number, note: string) => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canCreditWallet) {
      toast(`Permission Denied: '${role}' cannot adjust wallet ledgers. Required: finance or owner`, 'error');
      return;
    }
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, walletBalance: c.walletBalance + amount } : c
      )
    );
    toast(`Credited ₹${amount} to customer wallet. Note: ${note}`, 'success');
    appendAuditLog('WALLET_MANUAL_CREDIT', customerId, `Credited ₹${amount}. Note: ${note}`);
  };

  const toggleBlockCustomer = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, isBlocked: !c.isBlocked } : c))
    );
    const c = customers.find((x) => x.id === customerId);
    toast(`Customer ${c?.name} ${c?.isBlocked ? 'unblocked' : 'blocked'}`, 'warn');
    appendAuditLog('CUSTOMER_BLOCK_TOGGLE', customerId, `Toggled block state`);
  };

  const sendPushNotification = (title: string, body: string, segment: string) => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canAccessMarketing) {
      toast(`Permission Denied: '${role}' cannot broadcast push notifications.`, 'error');
      return;
    }
    const newPush: PushNotification = {
      id: `PSH-${Math.floor(10 + Math.random() * 90)}`,
      title,
      body,
      targetSegment: segment,
      sentAt: 'Just now',
      delivered: 1240,
      opened: 1,
      openRate: 0.1,
    };
    setPushNotifications((prev) => [newPush, ...prev]);
    toast(`Push broadcast transmitted to segment '${segment}'!`, 'success');
    appendAuditLog('PUSH_SENT', segment, title);
  };

  const createCoupon = (code: string, title: string, type: 'FLAT' | 'PERCENT', value: number, budget: number) => {
    const newC: Coupon = {
      id: `CPN-${Math.floor(10 + Math.random() * 90)}`,
      code: code.toUpperCase().trim(),
      title,
      type,
      value,
      minOrder: 20,
      usageCount: 0,
      maxUsage: 250,
      budgetCap: budget,
      budgetBurned: 0,
      expiresAt: '30 Oct 2026',
      status: 'ACTIVE',
    };
    setCoupons((prev) => [newC, ...prev]);
    toast(`Coupon code ${newC.code} activated with ₹${budget} budget cap`, 'success');
    appendAuditLog('COUPON_CREATED', newC.code, `Budget ₹${budget}, Value ${value}`);
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : c
      )
    );
    toast(`Coupon status updated.`, 'info');
  };

  const toggleMasterMode = (newMode: 'HOT' | 'COLD') => {
    const perm = ROLE_PERMISSIONS[role];
    if (!perm.canMutateMachines) {
      toast(`Permission Denied: Need ops or owner role.`, 'error');
      return;
    }
    setMachines((prev) =>
      prev.map((m) => ({
        ...m,
        mode: newMode,
        targetTemp: newMode === 'HOT' ? 66.0 : 6.0,
        temp: newMode === 'HOT' ? 64.5 : 6.5,
      }))
    );
    toast(`Master Festival Switch: All eligible machines flipped to ${newMode} mode!`, 'success');
    appendAuditLog('MASTER_MODE_FLIP', 'Fleet', `Flipped entire fleet to ${newMode}`);
  };

  return (
    <AdminContext.Provider
      value={{
        role,
        setRole,
        themeMode,
        setThemeMode,
        resolvedTheme,
        highContrast,
        setHighContrast,
        compactDensity,
        setCompactDensity,
        module,
        setModule,
        selectedMachineId,
        setSelectedMachineId,
        machineActiveTab,
        setMachineActiveTab,
        selectedOrderId,
        setSelectedOrderId,
        selectedTicketId,
        setSelectedTicketId,
        selectedCustomerId,
        setSelectedCustomerId,
        orderStubOpen,
        setOrderStubOpen,
        searchQuery,
        setSearchQuery,
        dateRange,
        setDateRange,
        machines,
        tanks,
        stock,
        orders,
        customers,
        tickets,
        coupons,
        banners,
        pushNotifications,
        adSpaces,
        auditLogs,
        lockMachine,
        unlockMachine,
        rebootMachine,
        testDispense,
        setTargetTemp,
        setMachineMode,
        mountTank,
        refillStock,
        addNewMachine,
        resolveDispute,
        refundOrder,
        markOrderFraud,
        openDisputeForOrder,
        creditWallet,
        toggleBlockCustomer,
        sendPushNotification,
        createCoupon,
        toggleCouponStatus,
        toggleMasterMode,
        navigateToMachine,
        navigateToOrder,
        navigateToTicket,
        navigateToCustomer,
        notifications,
        markNotificationRead,
        toasts,
        toast,
        dismissToast,
        lastSyncSecs,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
