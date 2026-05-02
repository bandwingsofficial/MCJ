// infrastructure/repositories/prisma-user.repository.ts

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { User as PrismaUser } from '@prisma/client';
import { Logger } from '@nestjs/common';

import type { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Phone } from '../../domain/value-objects/phone.vo';
import { Role } from '../../domain/enums/role.enum';
import { AccountStatus } from '../../domain/enums/account-status.enum';

export class PrismaUserRepository implements UserRepository {
  private readonly logger = new Logger(PrismaUserRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // 🟢 UPSERT (create or update safely)
  async save(user: User): Promise<void> {
    this.logger.log(`💾 Saving user: ${user.id}`);

    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email.getValue(),
        passwordHash: user.passwordHash,
        phone: user.phone ? user.phone.getValue() : null,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        updatedAt: user.updatedAt,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email.getValue(),
        passwordHash: user.passwordHash,
        phone: user.phone ? user.phone.getValue() : null,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }

  // 🔄 explicit update (still useful)
  async update(user: User): Promise<void> {
    this.logger.log(`🔄 Updating user: ${user.id}`);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email.getValue(),
        passwordHash: user.passwordHash,
        phone: user.phone ? user.phone.getValue() : null,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        updatedAt: user.updatedAt,
      },
    });
  }

  // 🔥 NEW: existence check (fast)
  async existsByEmail(email: Email): Promise<boolean> {
    const value = email.getValue();

    const count = await this.prisma.user.count({
      where: { email: value },
    });

    return count > 0;
  }

  async existsByPhone(phone: Phone): Promise<boolean> {
    const value = phone.getValue();

    const count = await this.prisma.user.count({
      where: { phone: value },
    });

    return count > 0;
  }

  // 🔥 NEW: targeted password update
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    this.logger.log(`🔐 Updating password for user: ${userId}`);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });
  }

  async findByEmail(email: Email): Promise<User | null> {
    const value = email.getValue();
    this.logger.log(`🔍 findByEmail: ${value}`);

    const record = await this.prisma.user.findUnique({
      where: { email: value },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByPhone(phone: Phone): Promise<User | null> {
    const value = phone.getValue();
    this.logger.log(`🔍 findByPhone: ${value}`);

    const record = await this.prisma.user.findUnique({
      where: { phone: value },
    });

    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    this.logger.log(`🔍 findById: ${id}`);

    const record = await this.prisma.user.findUnique({
      where: { id },
    });

    return record ? this.toDomain(record) : null;
  }

  // =====================
  // 🧠 MAPPER
  // =====================

  private toDomain(record: PrismaUser): User {
    return User.reconstitute({
      id: record.id,
      name: record.name,
      email: record.email,
      passwordHash: record.passwordHash,
      phone: record.phone ?? null,
      role: record.role as Role,
      status: record.status as AccountStatus,
      isEmailVerified: record.isEmailVerified,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}