// infrastructure/repositories/prisma-user.repository.ts

import { Logger } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import type { UserRepository } from '../../domain/repositories/user.repository';

import { User } from '../../domain/entities/user.entity';

import { Email } from '../../domain/value-objects/email.vo';
import { Phone } from '../../domain/value-objects/phone.vo';

import { AccountStatus } from '../../domain/enums/account-status.enum';

import { UserMapper } from '../mappers/user.mapper';

export class PrismaUserRepository implements UserRepository {
  private readonly logger = new Logger(PrismaUserRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // =====================
  // 💾 SAVE
  // =====================

  async save(user: User): Promise<void> {
    this.logger.log(`💾 Saving user: ${user.id}`);

    const data = UserMapper.toPersistence(user);

    await this.prisma.user.upsert({
      where: { id: user.id },

      update: {
        ...data,
      },

      create: {
        ...data,
      },
    });
  }

  async delete(userId: string): Promise<void> {
    this.logger.log(`🗑️ Deleting user: ${userId}`);

    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  // =====================
  // 🔍 FINDERS
  // =====================

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id },
    });

    return record ? UserMapper.toDomain(record) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: {
        email: email.getValue(),
      },
    });

    return record ? UserMapper.toDomain(record) : null;
  }

  async findByPhone(phone: Phone): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: {
        phone: phone.getValue(),
      },
    });

    return record ? UserMapper.toDomain(record) : null;
  }

  async findActiveByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: {
        email: email.getValue(),
        status: AccountStatus.ACTIVE,
        deletedAt: null,
      },
    });

    return record ? UserMapper.toDomain(record) : null;
  }

  // =====================
  // ✅ EXISTS
  // =====================

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id },
    });

    return count > 0;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        email: email.getValue(),
      },
    });

    return count > 0;
  }

  async existsByPhone(phone: Phone): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        phone: phone.getValue(),
      },
    });

    return count > 0;
  }

  // =====================
  // 🔐 SECURITY
  // =====================

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },

      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });
  }

  async updateMfa(
    userId: string,
    params: {
      mfaEnabled: boolean;
      mfaSecret: string | null;
      mfaVerifiedAt: Date | null;
    },
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },

      data: {
        mfaEnabled: params.mfaEnabled,
        mfaSecret: params.mfaSecret,
        mfaVerifiedAt: params.mfaVerifiedAt,

        updatedAt: new Date(),
      },
    });
  }

  async incrementTokenVersion(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },

      data: {
        tokenVersion: {
          increment: 1,
        },

        updatedAt: new Date(),
      },
    });
  }

  // =====================
  // 🧠 ACCOUNT STATE
  // =====================

  async updateLastLoginAt(userId: string, date: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },

      data: {
        lastLoginAt: date,
      },
    });
  }

  async updateStatus(userId: string, status: User['status']): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },

      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }
}
