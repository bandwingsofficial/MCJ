// domain/entities/password-reset-token.entity.ts

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class PasswordResetToken {
  private constructor(
    public readonly id: string,
    public readonly userId: string,

    // 🔐 OTP
    public otpHash: string,

    // 🔥 security
    public attempts: number,
    public isUsed: boolean,

    // 🔥 tracking
    public requestedFromIp: string | null,
    public lastAttemptAt: Date | null,

    // ⏳ lifecycle
    public readonly createdAt: Date,
    public updatedAt: Date,
    public expiresAt: Date,
  ) {}

  // =====================
  // 🟢 FACTORY
  // =====================

  static create(params: {
    id: string;
    userId: string;
    otpHash: string;

    requestedFromIp?: string;

    expiresAt: Date;
  }): PasswordResetToken {
    if (!params.userId) {
      throw new DomainError(ERROR_CODES.VALIDATION_ERROR, 'UserId is required');
    }

    if (!params.otpHash) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'OTP hash is required',
      );
    }

    if (params.expiresAt <= new Date()) {
      throw new DomainError(
        ERROR_CODES.SESSION_EXPIRED,
        'OTP expiry must be in the future',
        { expiresAt: params.expiresAt },
      );
    }

    const now = new Date();

    return new PasswordResetToken(
      params.id,
      params.userId,

      params.otpHash,

      0,
      false,

      params.requestedFromIp ?? null,
      null,

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

    otpHash: string;

    attempts: number;
    isUsed: boolean;

    requestedFromIp: string | null;
    lastAttemptAt: Date | null;

    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
  }): PasswordResetToken {
    return new PasswordResetToken(
      params.id,
      params.userId,

      params.otpHash,

      params.attempts ?? 0,
      params.isUsed,

      params.requestedFromIp,
      params.lastAttemptAt,

      params.createdAt,
      params.updatedAt,
      params.expiresAt,
    );
  }

  // =====================
  // 🔐 DOMAIN BEHAVIOR
  // =====================

  markUsed() {
    if (this.isUsed) {
      throw new DomainError(ERROR_CODES.VALIDATION_ERROR, 'OTP already used');
    }

    this.isUsed = true;

    this.touch();
  }

  incrementAttempts() {
    if (this.isUsed) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'Cannot increment attempts for used OTP',
      );
    }

    this.attempts += 1;
    this.lastAttemptAt = new Date();

    this.touch();
  }

  // =====================
  // 🧠 BUSINESS RULES
  // =====================

  isExpired(now: Date = new Date()): boolean {
    return now > this.expiresAt;
  }

  hasExceededAttempts(): boolean {
    return this.attempts >= 5;
  }

  canBeUsed(): boolean {
    if (this.isUsed) {
      throw new DomainError(ERROR_CODES.VALIDATION_ERROR, 'OTP already used');
    }

    if (this.isExpired()) {
      throw new DomainError(ERROR_CODES.SESSION_EXPIRED, 'OTP expired');
    }

    if (this.hasExceededAttempts()) {
      throw new DomainError(
        ERROR_CODES.TOO_MANY_REQUESTS,
        'Too many OTP attempts',
      );
    }

    return true;
  }

  // =====================
  // 🔒 HELPERS
  // =====================

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  // =====================
  // 🛠️ INTERNAL
  // =====================

  private touch() {
    this.updatedAt = new Date();
  }
}
