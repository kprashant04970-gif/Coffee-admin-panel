/**
 * Manhattan Coffee Vending Network — Enterprise RBAC Engine
 * File: lib/rbac.ts
 *
 * Implements strict 6-Role Role-Based Access Control matrix, Route-to-Role guards,
 * and permission checkers for Middleware and Server Actions.
 */

export type UserRole = 'viewer' | 'support' | 'ops' | 'marketing' | 'finance' | 'owner';

export interface RoleDefinition {
  name: UserRole;
  label: string;
  rank: number; // Hierarchical rank for inheritance comparisons
  description: string;
}

export const ROLES: Record<UserRole, RoleDefinition> = {
  viewer: {
    name: 'viewer',
    label: 'Read-Only Viewer',
    rank: 1,
    description: 'Read-only access to operational overview and public telemetry.',
  },
  support: {
    name: 'support',
    label: 'Support & Dispute Agent',
    rank: 2,
    description: 'Triage dispute tickets, inspect CCTV evidence, and handle 5-minute SLAs.',
  },
  ops: {
    name: 'ops',
    label: 'Field Operations & Fleet Engineer',
    rank: 3,
    description: 'Control hardware actuators, flush cycles, tank refilling, and remote MQTT commands.',
  },
  marketing: {
    name: 'marketing',
    label: 'Growth & Ads Manager',
    rank: 3,
    description: 'Manage ad spaces, banners, push notifications, and coupon budgets.',
  },
  finance: {
    name: 'finance',
    label: 'Financial Controller',
    rank: 4,
    description: 'Approve refund disbursements, manage supplier purchase orders, and audit unit margins.',
  },
  owner: {
    name: 'owner',
    label: 'Executive Owner (Root)',
    rank: 10,
    description: 'Unrestricted root authority across all telemetry, secrets, and financial ledgers.',
  },
};

/**
 * Route protection rules for Next.js Edge Middleware
 * Rules are evaluated from most specific to least specific.
 */
export interface RouteGuardRule {
  pattern: RegExp;
  requiredRoles: UserRole[];
  friendlyName: string;
}

export const ROUTE_GUARD_RULES: RouteGuardRule[] = [
  // 1. Settings & Secret Rotations -> 'owner' only
  {
    pattern: /^\/settings(\/.*)?$/,
    requiredRoles: ['owner'],
    friendlyName: 'System Security & Secret Rotation',
  },
  // 2. Hardware Firmware/OTA and Critical Hardware commands -> 'owner' only
  {
    pattern: /^\/machines\/[^/]+\/hardware(\/.*)?$/,
    requiredRoles: ['owner'],
    friendlyName: 'Machine Firmware & OTA Flashing',
  },
  // 3. Financial Refunds Approval -> 'finance' or 'ops' or 'owner'
  {
    pattern: /^\/support\/refunds(\/.*)?$/,
    requiredRoles: ['finance', 'ops', 'owner'],
    friendlyName: 'Financial Refund Authorization Desk',
  },
  // 4. Inventory Supplies & Cost Basis -> 'finance' or 'owner'
  {
    pattern: /^\/inventory\/supplies(\/.*)?$/,
    requiredRoles: ['finance', 'owner'],
    friendlyName: 'Raw Material Cost Basis & Inventory Supply',
  },
  // 5. Dispute Desk (Ticket Review & Video Evidence) -> 'support', 'ops', 'finance', 'owner'
  {
    pattern: /^\/support\/tickets(\/.*)?$/,
    requiredRoles: ['support', 'ops', 'finance', 'owner'],
    friendlyName: '5-Minute Dispute Desk & Evidence Inspector',
  },
  // 6. Support Module Root -> 'support', 'ops', 'finance', 'owner'
  {
    pattern: /^\/support(\/.*)?$/,
    requiredRoles: ['support', 'ops', 'finance', 'owner'],
    friendlyName: 'Customer Support Board',
  },
  // 7. Marketing Module -> 'marketing' or 'owner'
  {
    pattern: /^\/marketing(\/.*)?$/,
    requiredRoles: ['marketing', 'owner'],
    friendlyName: 'Campaign & Ad Revenue Space Manager',
  },
  // 8. General Fleet Machine Control -> 'ops' or 'owner' (mutation pages)
  {
    pattern: /^\/machines(\/.*)?$/,
    requiredRoles: ['viewer', 'support', 'ops', 'marketing', 'finance', 'owner'],
    friendlyName: 'Fleet Telemetry Grid',
  },
  // 9. Orders Queue -> All authenticated roles
  {
    pattern: /^\/orders(\/.*)?$/,
    requiredRoles: ['viewer', 'support', 'ops', 'marketing', 'finance', 'owner'],
    friendlyName: 'Order Dispense Logs',
  },
];

/**
 * Granular Action Permissions Matrix for Server Actions & API Handlers
 */
export type PermissionKey =
  | 'finance.refund.approve'
  | 'finance.supplier.order'
  | 'hardware.ota.update'
  | 'hardware.command.dispatch'
  | 'support.dispute.resolve'
  | 'support.ticket.triage'
  | 'marketing.campaign.publish'
  | 'settings.secret.rotate'
  | 'inventory.tank.mount';

export const PERMISSION_MATRIX: Record<PermissionKey, UserRole[]> = {
  'finance.refund.approve': ['finance', 'ops', 'owner'],
  'finance.supplier.order': ['finance', 'owner'],
  'hardware.ota.update': ['owner'],
  'hardware.command.dispatch': ['ops', 'owner'],
  'support.dispute.resolve': ['support', 'ops', 'owner'],
  'support.ticket.triage': ['support', 'ops', 'finance', 'owner'],
  'marketing.campaign.publish': ['marketing', 'owner'],
  'settings.secret.rotate': ['owner'],
  'inventory.tank.mount': ['ops', 'owner'],
};

/**
 * Evaluates whether a given user role is authorized against a required role or list of roles.
 */
export function authorize(
  userRole: string | undefined | null,
  requiredRole: UserRole | UserRole[]
): boolean {
  if (!userRole) return false;
  const role = userRole.toLowerCase() as UserRole;
  if (role === 'owner') return true; // Owner has root super-user override

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(role);
  }

  return role === requiredRole;
}

/**
 * Evaluates whether a user role possesses a specific granular action permission.
 */
export function hasPermission(
  userRole: string | undefined | null,
  permission: PermissionKey
): boolean {
  if (!userRole) return false;
  const role = userRole.toLowerCase() as UserRole;
  if (role === 'owner') return true;

  const allowedRoles = PERMISSION_MATRIX[permission] || [];
  return allowedRoles.includes(role);
}

/**
 * Evaluates an incoming URL pathname against the Route Guard rules.
 * Returns the matching rule or null if the route is public.
 */
export function getRouteGuardRule(pathname: string): RouteGuardRule | null {
  for (const rule of ROUTE_GUARD_RULES) {
    if (rule.pattern.test(pathname)) {
      return rule;
    }
  }
  return null;
}
