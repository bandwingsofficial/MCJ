// domain/entities/password-reset-token.entity.ts

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class PasswordResetToken {
  private constructor(
    public readonly id: string,
    public readonly userId: string,

    public otpHash: string,

    public attempts: number,      // 🔥 NEW
    public isUsed: boolean,

    public readonly createdAt: Date,
    public expiresAt: Date,
  ) {}

  // =====================
  // 🟢 FACTORY
  // =====================

  static create(params: {
    id: string;
    userId: string;
    otpHash: string;
    expiresAt: Date;
  }): PasswordResetToken {
    if (!params.userId) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'UserId is required',
      );
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

    return new PasswordResetToken(
      params.id,
      params.userId,
      params.otpHash,
      0, // 🔥 attempts start at 0
      false,
      new Date(),
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
    attempts: number;       // 🔥 NEW
    isUsed: boolean;
    createdAt: Date;
    expiresAt: Date;
  }): PasswordResetToken {
    return new PasswordResetToken(
      params.id,
      params.userId,
      params.otpHash,
      params.attempts ?? 0,
      params.isUsed,
      params.createdAt,
      params.expiresAt,
    );
  }

  // =====================
  // 🔐 DOMAIN BEHAVIOR
  // =====================

  markUsed() {
    if (this.isUsed) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'OTP already used',
      );
    }

    this.isUsed = true;
  }

  incrementAttempts() {
    this.attempts += 1;
  }

  isExpired(now: Date = new Date()): boolean {
    return now > this.expiresAt;
  }

  hasExceededAttempts(): boolean {
    return this.attempts >= 5; // 🔥 configurable later
  }

  canBeUsed(): boolean {
    if (this.isUsed) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'OTP already used',
      );
    }

    if (this.isExpired()) {
      throw new DomainError(
        ERROR_CODES.SESSION_EXPIRED,
        'OTP expired',
      );
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
  // 🧠 SECURITY HELPERS
  // =====================

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }
}