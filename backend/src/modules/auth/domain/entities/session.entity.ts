// domain/entities/session.entity.ts

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';
import { DeviceType } from '../enums/device-type.enum';

export class Session {
  private constructor(
    public readonly id: string,
    public readonly userId: string,

    public refreshTokenHash: string,

    public userAgent: string | null,
    public ipAddress: string | null,
    public deviceType: DeviceType, // 🔥 NEW

    public isRevoked: boolean,
    public revokedAt: Date | null, // 🔥 NEW

    public readonly createdAt: Date,
    public updatedAt: Date,
    public expiresAt: Date,
  ) {}

  // 🟢 Create new session (on login)
  static create(params: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    deviceType?: DeviceType;
    expiresAt: Date;
  }): Session {
    if (!params.refreshTokenHash) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'Refresh token hash is required',
      );
    }

    if (params.expiresAt <= new Date()) {
      throw new DomainError(
        ERROR_CODES.SESSION_EXPIRED,
        'Session expiry must be in the future',
        { expiresAt: params.expiresAt },
      );
    }

    return new Session(
      params.id,
      params.userId,
      params.refreshTokenHash,
      params.userAgent ?? null,
      params.ipAddress ?? null,
      params.deviceType ?? DeviceType.UNKNOWN, // 🔥 NEW
      false,
      null,
      new Date(),
      new Date(),
      params.expiresAt,
    );
  }

  // 🔵 Reconstitute from DB
  static reconstitute(params: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    userAgent: string | null;
    ipAddress: string | null;
    deviceType: DeviceType;
    isRevoked: boolean;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
  }): Session {
    return new Session(
      params.id,
      params.userId,
      params.refreshTokenHash,
      params.userAgent,
      params.ipAddress,
      params.deviceType,
      params.isRevoked,
      params.revokedAt,
      params.createdAt,
      params.updatedAt,
      params.expiresAt,
    );
  }

  // =====================
  // 🔐 DOMAIN BEHAVIORS
  // =====================

  revoke() {
    // ✅ idempotent
    if (this.isRevoked) return;

    this.isRevoked = true;
    this.revokedAt = new Date(); // 🔥 NEW
    this.touch();
  }

  rotate(newHash: string, newExpiry: Date) {
    if (this.isRevoked) {
      throw new DomainError(
        ERROR_CODES.SESSION_REVOKED,
        'Cannot rotate a revoked session',
        { sessionId: this.id },
      );
    }

    if (this.isExpired()) {
      throw new DomainError(
        ERROR_CODES.SESSION_EXPIRED,
        'Cannot rotate an expired session',
        { sessionId: this.id },
      );
    }

    if (!newHash) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'New refresh token hash is required',
      );
    }

    // 🔥 NEW: prevent same token reuse (extra safety)
    if (this.refreshTokenHash === newHash) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'New refresh token must be different',
      );
    }

    if (newExpiry <= new Date()) {
      throw new DomainError(
        ERROR_CODES.SESSION_EXPIRED,
        'New expiry must be in the future',
        { newExpiry },
      );
    }

    this.refreshTokenHash = newHash;
    this.expiresAt = newExpiry;
    this.touch();
  }

  isExpired(now: Date = new Date()): boolean {
    return now > this.expiresAt;
  }

  isActive(): boolean {
    return !this.isRevoked && !this.isExpired();
  }

  // =====================
  // 🧠 HELPER METHODS (NEW)
  // =====================

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  canBeUsed(): boolean {
    if (this.isRevoked) {
      throw new DomainError(
        ERROR_CODES.SESSION_REVOKED,
        'Session is revoked',
      );
    }

    if (this.isExpired()) {
      throw new DomainError(
        ERROR_CODES.SESSION_EXPIRED,
        'Session is expired',
      );
    }

    return true;
  }

  // =====================
  // 🛠️ INTERNAL
  // =====================

  private touch() {
    this.updatedAt = new Date();
  }
}