// domain/repositories/audit-log.repository.ts

import { AuditLog } from '../entities/audit-log.entity';
import { AuditAction } from '../enums/audit-action.enum';

export interface AuditLogRepository {
  // 🟢 core
  create(log: AuditLog): Promise<void>;

  // =====================
  // 🔍 READ
  // =====================

  findByUserId(userId: string): Promise<AuditLog[]>;

  findByUserIdAndAction(
    userId: string,
    action: AuditAction,
  ): Promise<AuditLog[]>;

  // 🔥 NEW: session-level tracking
  findBySessionId(sessionId: string): Promise<AuditLog[]>;

  // 🔥 NEW: security events (very important)
  findSecurityEventsByUserId(userId: string): Promise<AuditLog[]>;

  // 🔥 NEW: paginated timeline (real-world requirement)
  findByUserIdPaginated(params: {
    userId: string;
    limit: number;
    cursor?: string; // last log id
  }): Promise<AuditLog[]>;

  // 🔥 system-wide
  findRecent(limit: number): Promise<AuditLog[]>;

  // 🔥 optional admin filter
  findByAction(action: AuditAction, limit: number): Promise<AuditLog[]>;
}