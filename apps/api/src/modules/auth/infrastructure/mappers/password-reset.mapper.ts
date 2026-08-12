// infrastructure/mappers/password-reset.mapper.ts

import { PasswordResetToken as PrismaPasswordResetToken } from '@prisma/client';

import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';

export class PasswordResetMapper {
  // =====================
  // 🔵 DB → DOMAIN
  // =====================

  static toDomain(record: PrismaPasswordResetToken): PasswordResetToken {
    return PasswordResetToken.reconstitute({
      id: record.id,

      userId: record.userId,

      otpHash: record.otpHash,

      attempts: record.attempts,
      isUsed: record.isUsed,

      requestedFromIp: record.requestedFromIp ?? null,

      lastAttemptAt: record.lastAttemptAt ?? null,

      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      expiresAt: record.expiresAt,
    });
  }

  // =====================
  // 🟢 DOMAIN → DB
  // =====================

  static toPersistence(token: PasswordResetToken) {
    return {
      id: token.id,

      userId: token.userId,

      otpHash: token.otpHash,

      attempts: token.attempts,
      isUsed: token.isUsed,

      requestedFromIp: token.requestedFromIp,

      lastAttemptAt: token.lastAttemptAt,

      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
      expiresAt: token.expiresAt,
    };
  }
}
