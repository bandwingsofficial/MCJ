// infrastructure/repositories/prisma-password-reset.repository.ts

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { PasswordResetToken as PrismaReset } from '@prisma/client';
import { Logger } from '@nestjs/common';

import type { PasswordResetRepository } from '../../domain/repositories/password-reset.repository';
import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';

export class PrismaPasswordResetRepository
  implements PasswordResetRepository
{
  private readonly logger = new Logger(
    PrismaPasswordResetRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  // =====================
  // 🟢 CREATE
  // =====================
  async save(token: PasswordResetToken): Promise<void> {
    this.logger.log(
      `🔐 Creating password reset token for user: ${token.userId}`,
    );

    await this.prisma.passwordResetToken.create({
      data: {
        id: token.id,
        userId: token.userId,
        otpHash: token.otpHash,

        attempts: token.attempts, // 🔥 FIXED
        isUsed: token.isUsed,

        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
      },
    });
  }

  // =====================
  // 🔍 READ
  // =====================
  async findLatestByUserId(
    userId: string,
  ): Promise<PasswordResetToken | null> {
    const record = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return record ? this.toDomain(record) : null;
  }

  // =====================
  // 🔄 UPDATE
  // =====================
  async update(token: PasswordResetToken): Promise<void> {
    this.logger.log(`🔄 Updating reset token: ${token.id}`);

    await this.prisma.passwordResetToken.update({
      where: { id: token.id },
      data: {
        attempts: token.attempts, // 🔥 CRITICAL
        isUsed: token.isUsed,
        expiresAt: token.expiresAt, // 🔥 safe future-proof
      },
    });
  }

  // =====================
  // 🧹 CLEANUP
  // =====================
  async deleteExpiredByUserId(userId: string): Promise<void> {
    this.logger.log(
      `🧹 Cleaning expired tokens for user: ${userId}`,
    );

    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId,
        OR: [
          { isUsed: true },
          {
            expiresAt: {
              lt: new Date(),
            },
          },
        ],
      },
    });
  }

  // =====================
  // 🧠 MAPPER
  // =====================
  private toDomain(record: PrismaReset): PasswordResetToken {
    return PasswordResetToken.reconstitute({
      id: record.id,
      userId: record.userId,
      otpHash: record.otpHash,

      attempts: record.attempts ?? 0, // 🔥 FIXED
      isUsed: record.isUsed,

      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
    });
  }
}