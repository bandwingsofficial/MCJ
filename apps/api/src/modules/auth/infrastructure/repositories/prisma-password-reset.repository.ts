// infrastructure/repositories/prisma-password-reset.repository.ts

import { Logger } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import type { PasswordResetRepository } from '../../domain/repositories/password-reset.repository';

import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';

import { PasswordResetMapper } from '../mappers/password-reset.mapper';

export class PrismaPasswordResetRepository implements PasswordResetRepository {
  private readonly logger = new Logger(PrismaPasswordResetRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // =====================
  // 💾 PERSISTENCE
  // =====================

  async save(token: PasswordResetToken): Promise<void> {
    const data = PasswordResetMapper.toPersistence(token);

    await this.prisma.passwordResetToken.create({
      data,
    });
  }

  async update(token: PasswordResetToken): Promise<void> {
    const data = PasswordResetMapper.toPersistence(token);

    await this.prisma.passwordResetToken.update({
      where: {
        id: token.id,
      },

      data: {
        attempts: data.attempts,
        isUsed: data.isUsed,

        lastAttemptAt: data.lastAttemptAt,

        updatedAt: data.updatedAt,

        expiresAt: data.expiresAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.passwordResetToken.delete({
      where: { id },
    });
  }

  // =====================
  // 🔍 FINDERS
  // =====================

  async findById(id: string): Promise<PasswordResetToken | null> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { id },
    });

    return record ? PasswordResetMapper.toDomain(record) : null;
  }

  async findLatestByUserId(userId: string): Promise<PasswordResetToken | null> {
    const record = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return record ? PasswordResetMapper.toDomain(record) : null;
  }

  async findLatestActiveByUserId(
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

    return record ? PasswordResetMapper.toDomain(record) : null;
  }

  // =====================
  // 🧠 VALIDATION
  // =====================

  async existsActiveToken(userId: string): Promise<boolean> {
    const count = await this.prisma.passwordResetToken.count({
      where: {
        userId,

        isUsed: false,

        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return count > 0;
  }

  async countRecentRequests(userId: string, since: Date): Promise<number> {
    return this.prisma.passwordResetToken.count({
      where: {
        userId,

        createdAt: {
          gte: since,
        },
      },
    });
  }

  // =====================
  // 🧹 CLEANUP
  // =====================

  async deleteExpiredByUserId(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId,

        OR: [
          {
            isUsed: true,
          },

          {
            expiresAt: {
              lt: new Date(),
            },
          },
        ],
      },
    });
  }

  async deleteUsedTokensByUserId(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId,

        isUsed: true,
      },
    });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
