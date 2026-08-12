// domain/entities/session.entity.ts

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';
import { DeviceType } from '../enums/device-type.enum';

export class Session {
  private constructor(
    public readonly id: string,
    public readonly userId: string,

    // 🔐 token
    public refreshTokenHash: string,

    // 📱 device
    public userAgent: string | null,
    public ipAddress: string | null,
    public deviceType: DeviceType,

    // 🔥 optional fingerprint
    public fingerprint: string | null,

    // 🔥 state
    public isRevoked: boolean,
    public revokedAt: Date | null,

    // 🔥 activity
    public lastUsedAt: Date | null,

    // ⏳ lifecycle
    public readonly createdAt: Date,
    public updatedAt: Date,
    public expiresAt: Date,
  ) {}

  // =====================
  // 🟢 CREATE
  // =====================

  static create(params: {
    id: string;
    userId: string;
    refreshTokenHash: string;

    userAgent?: string;
    ipAddress?: string;
    deviceType?: DeviceType;

    fingerprint?: string;

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

    const now = new Date();

    return new Session(
      params.id,
      params.userId,

      params.refreshTokenHash,

      params.userAgent ?? null,
      params.ipAddress ?? null,
      params.deviceType ?? DeviceType.UNKNOWN,

      params.fingerprint ?? null,

      false,
      null,

      now,

      now,
      now,
      params.expiresAt,
    );
  }

  // =====================
  // 🔵 RECONSTITUTE
  // =====================

  static reconstitute(params: {
    id: string;
    userId: string;

    refreshTokenHash: string;

    userAgent: string | null;
    ipAddress: string | null;
    deviceType: DeviceType;

    fingerprint: string | null;

    isRevoked: boolean;
    revokedAt: Date | null;

    lastUsedAt: Date | null;

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

      params.fingerprint,

      params.isRevoked,
      params.revokedAt,

      params.lastUsedAt,

      params.createdAt,
      params.updatedAt,
      params.expiresAt,
    );
  }

  // =====================
  // 🔐 DOMAIN BEHAVIORS
  // =====================

  revoke() {
    if (this.isRevoked) return;

    this.isRevoked = true;
    this.revokedAt = new Date();

    this.touch();
  }

  rotate(newHash: string, newExpiry: Date) {
    if (this.isRevoked) {
      throw new DomainError(
        ERROR_CODES.SESSION_REVOKED,
        'Cannot rotate revoked session',
        { sessionId: this.id },
      );
    }

    if (this.isExpired()) {
      throw new DomainError(
        ERROR_CODES.SESSION_EXPIRED,
        'Cannot rotate expired session',
        { sessionId: this.id },
      );
    }

    if (!newHash) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'New refresh token hash is required',
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

    this.markUsed();
    this.touch();
  }

  markUsed() {
    this.lastUsedAt = new Date();
    this.touch();
  }

  // =====================
  // 🧠 BUSINESS RULES
  // =====================

  isExpired(now: Date = new Date()): boolean {
    return now > this.expiresAt;
  }

  isActive(): boolean {
    return !this.isRevoked && !this.isExpired();
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  canBeUsed(): boolean {
    if (this.isRevoked) {
      throw new DomainError(ERROR_CODES.SESSION_REVOKED, 'Session is revoked');
    }

    if (this.isExpired()) {
      throw new DomainError(ERROR_CODES.SESSION_EXPIRED, 'Session is expired');
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
