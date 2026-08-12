// domain/entities/audit-log.entity.ts

import { AuditAction } from '../enums/audit-action.enum';
import { DeviceType } from '../enums/device-type.enum';

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class AuditLog {
  private constructor(
    public readonly id: string,

    // 👤 actor
    public readonly userId: string | null,

    // 🔥 action
    public readonly action: AuditAction,

    // 🔗 traceability
    public readonly sessionId: string | null,

    // 🌐 request info
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public readonly deviceType: DeviceType,

    // 🧠 extra metadata
    public readonly metadata: Record<string, unknown> | null,

    // ⏳ timestamp
    public readonly createdAt: Date,
  ) {}

  // =====================
  // 🟢 FACTORY
  // =====================

  static create(params: {
    id: string;

    userId?: string | null;

    action: AuditAction;

    sessionId?: string | null;

    ipAddress?: string | null;
    userAgent?: string | null;

    deviceType?: DeviceType;

    metadata?: Record<string, unknown> | null;
  }): AuditLog {
    if (!params.action) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'Audit action is required',
      );
    }

    // 🔥 protect against huge payloads
    if (params.metadata && JSON.stringify(params.metadata).length > 5000) {
      throw new DomainError(ERROR_CODES.VALIDATION_ERROR, 'Metadata too large');
    }

    return new AuditLog(
      params.id,

      params.userId ?? null,

      params.action,

      params.sessionId ?? null,

      params.ipAddress ?? null,
      params.userAgent ?? null,
      params.deviceType ?? DeviceType.UNKNOWN,

      params.metadata ?? null,

      new Date(),
    );
  }

  // =====================
  // 🔵 RECONSTITUTE
  // =====================

  static reconstitute(params: {
    id: string;

    userId: string | null;

    action: AuditAction;

    sessionId: string | null;

    ipAddress: string | null;
    userAgent: string | null;

    deviceType: DeviceType;

    metadata: Record<string, unknown> | null;

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
  // 🧠 HELPERS
  // =====================

  isSecurityEvent(): boolean {
    return [
      AuditAction.LOGIN_FAILED,
      AuditAction.SESSION_REVOKED,
      AuditAction.PASSWORD_RESET_FAILED,
      AuditAction.MFA_FAILED,
      AuditAction.ADMIN_LOGIN_FAILED,
    ].includes(this.action);
  }

  isAdminEvent(): boolean {
    return [AuditAction.ADMIN_LOGIN, AuditAction.ADMIN_LOGIN_FAILED].includes(
      this.action,
    );
  }

  hasMetadata(): boolean {
    return !!this.metadata;
  }
}
