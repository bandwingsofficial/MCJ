// domain/repositories/audit-log.repository.ts

import { AuditLog } from '../entities/audit-log.entity';
import { AuditAction } from '../enums/audit-action.enum';

export interface AuditLogRepository {
  // =====================
  // 🟢 WRITE
  // =====================

  create(log: AuditLog): Promise<void>;

  // =====================
  // 🔍 READ
  // =====================

  findById(id: string): Promise<AuditLog | null>;

  findByUserId(userId: string): Promise<AuditLog[]>;

  findByUserIdAndAction(
    userId: string,
    action: AuditAction,
  ): Promise<AuditLog[]>;

  // 🔥 session traceability
  findBySessionId(sessionId: string): Promise<AuditLog[]>;

  // 🔥 security monitoring
  findSecurityEventsByUserId(userId: string): Promise<AuditLog[]>;

  // 🔥 admin/security timeline
  findByUserIdPaginated(params: {
    userId: string;
    limit: number;
    cursor?: string;
  }): Promise<AuditLog[]>;

  // 🔥 global activity
  findRecent(limit: number): Promise<AuditLog[]>;

  findByAction(action: AuditAction, limit: number): Promise<AuditLog[]>;

  // =====================
  // 🧠 ANALYTICS / SECURITY
  // =====================

  countByUserIdAndAction(params: {
    userId: string;
    action: AuditAction;
    since?: Date;
  }): Promise<number>;

  hasRecentSecurityEvent(params: {
    userId: string;
    action: AuditAction;
    since: Date;
  }): Promise<boolean>;

  // =====================
  // 🧹 CLEANUP
  // =====================

  deleteOlderThan(date: Date): Promise<void>;
}
