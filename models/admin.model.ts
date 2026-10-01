import { AdminUserModel, AuditLogModel, UserRole } from '@/types';

export class AdminUserEntity {
  constructor(public data: AdminUserModel) {}

  canAccess(role: UserRole): boolean {
    if (this.data.role === 'owner') return true;
    return this.data.role === role;
  }
}

export class AuditLogEntity {
  constructor(public data: AuditLogModel) {}

  get formattedTimestamp(): string {
    return new Date(this.data.createdAt).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });
  }
}
