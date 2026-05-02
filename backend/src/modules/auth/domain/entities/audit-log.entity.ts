// domain/entities/audit-log.entity.ts

import { AuditAction } from '../enums/audit-action.enum';
import { DeviceType } from '../enums/device-type.enum';

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class AuditLog {
  private constructor(
    public readonly id: string,
    public readonly userId: string | null,
    public readonly action: AuditAction,
    public readonly sessionId: string | null,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public readonly deviceType: DeviceType, // 🔥 NEW
    public readonly metadata: Record<string, any> | null,
    public readonly createdAt: Date,
  ) {}

  // 🟢 Factory (create new log)
  static create(params: {
    id: string;
    userId?: string | null;
    action: AuditAction;
    sessionId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    deviceType?: DeviceType; // 🔥 NEW
    metadata?: Record<string, any> | null;
  }): AuditLog {
    if (!params.action) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'Audit action is required',
      );
    }

    // 🔥 Optional: basic metadata size guard (avoid huge payloads)
    if (params.metadata && JSON.stringify(params.metadata).length > 5000) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'Metadata too large',
      );
    }

    return new AuditLog(
      params.id,
      params.userId ?? null,
      params.action,
      params.sessionId ?? null,
      params.ipAddress ?? null,
      params.userAgent ?? null,
      params.deviceType ?? DeviceType.UNKNOWN, // 🔥 NEW
      params.metadata ?? null,
      new Date(),
    );
  }

  // 🔵 Reconstitution (DB → Domain)
  static reconstitute(params: {
    id: string;
    userId: string | null;
    action: AuditAction;
    sessionId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    deviceType: DeviceType; // 🔥 NEW
    metadata: any;
    createdAt: Date;
  }): AuditLog {
    return new AuditLog(
      params.id,
      params.userId,
      params.action,
      params.sessionId,
      params.ipAddress,
      params.userAgent,
      params.deviceType,
      params.metadata ?? null,
      params.createdAt,
    );
  }

  // =====================
  // 🧠 HELPER METHODS (OPTIONAL)
  // =====================

  isSecurityEvent(): boolean {
    return [
      AuditAction.LOGIN_FAILED,
      AuditAction.SESSION_REVOKED,
      AuditAction.PASSWORD_RESET_FAILED,
    ].includes(this.action);
  }
}