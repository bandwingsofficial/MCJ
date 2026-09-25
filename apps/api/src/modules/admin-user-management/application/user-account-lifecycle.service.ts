import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, Prisma, ReferralStatus, Role } from '@prisma/client';
import { randomBytes, randomUUID } from 'crypto';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { resolvePortalAccountStatus } from '../utils/account-status.util';

@Injectable()
export class UserAccountLifecycleService {
  constructor(private readonly prisma: PrismaService) {}

  async assertRegistrationAllowed(email: string, phone?: string | null) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
      },
      select: {
        id: true,
        deletedAt: true,
        status: true,
        lastLoginAt: true,
        role: true,
      },
    });

    if (existing) {
      const status = resolvePortalAccountStatus(existing);
      if (status === 'DELETED') {
        throw new ConflictException(
          'This account was deleted and cannot be registered again with the same email.',
        );
      }
      if (status === 'SUSPENDED') {
        throw new ConflictException(
          'This account is suspended. Please contact support.',
        );
      }
      const claimable =
        existing.role === Role.STUDENT && existing.lastLoginAt === null;
      if (!claimable) {
        throw new ConflictException('Email is already registered');
      }
    }

    const deletedEmail = await this.prisma.userDeletionRecord.findUnique({
      where: { originalEmailNormalized: normalizedEmail },
    });
    if (deletedEmail) {
      throw new ConflictException(
        'This account was deleted and cannot be registered again with the same email.',
      );
    }

    if (phone?.trim()) {
      const phoneUser = await this.prisma.user.findFirst({
        where: { phone: phone.trim() },
        select: { deletedAt: true, status: true, lastLoginAt: true, role: true },
      });
      if (phoneUser) {
        const status = resolvePortalAccountStatus(phoneUser);
        if (status === 'SUSPENDED') {
          throw new ConflictException(
            'This account is suspended. Please contact support.',
          );
        }
        if (status === 'DELETED') {
          throw new ConflictException(
            'This phone number belongs to a deleted account.',
          );
        }
        const claimable =
          phoneUser.role === Role.STUDENT && phoneUser.lastLoginAt === null;
        if (!claimable) {
          throw new ConflictException('Phone number is already registered');
        }
      }

      const deletedPhone = await this.prisma.userDeletionRecord.findFirst({
        where: { originalPhone: phone.trim() },
      });
      if (deletedPhone) {
        throw new ConflictException(
          'This phone number belongs to a deleted account.',
        );
      }
    }
  }

  async assertLoginAllowed(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { deletedAt: true, status: true },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const status = resolvePortalAccountStatus(user);
    if (status === 'DELETED') {
      throw new BadRequestException('Account has been deleted');
    }
    if (status === 'SUSPENDED') {
      throw new BadRequestException(
        'Your account has been suspended. Please contact support.',
      );
    }
  }

  async suspendUser(
    userId: string,
    adminUserId: string,
    reason?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      if (user.deletedAt) {
        throw new BadRequestException('Deleted users cannot be suspended');
      }
      if (user.status === AccountStatus.BLOCKED) {
        throw new BadRequestException('User is already suspended');
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          status: AccountStatus.BLOCKED,
          suspendedAt: new Date(),
          suspendedByUserId: adminUserId,
          suspensionReason: reason?.trim() || null,
        },
      });

      await tx.session.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true, revokedAt: new Date() },
      });
    });
  }

  async unsuspendUser(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      if (user.deletedAt) {
        throw new BadRequestException('Deleted users cannot be unsuspended');
      }
      if (user.status !== AccountStatus.BLOCKED) {
        throw new BadRequestException('User is not suspended');
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          status: AccountStatus.ACTIVE,
          suspendedAt: null,
          suspendedByUserId: null,
          suspensionReason: null,
        },
      });
    });
  }

  async permanentlyDeleteUser(input: {
    userId: string;
    actorUserId?: string;
    reason?: string;
    source: 'ADMIN' | 'SELF';
  }) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: input.userId },
        include: { userDeletionRecord: true },
      });
      if (!user) throw new NotFoundException('User not found');
      if (user.deletedAt || user.userDeletionRecord) {
        throw new BadRequestException('User is already deleted');
      }
      if (user.role === Role.ADMIN) {
        throw new BadRequestException('Admin accounts cannot be deleted here');
      }

      const tombstoneEmail = `deleted+${user.id}@deleted.mcj.local`;
      const normalizedOriginal = user.email.trim().toLowerCase();

      await tx.userDeletionRecord.create({
        data: {
          userId: user.id,
          originalEmailNormalized: normalizedOriginal,
          originalPhone: user.phone,
          deletedByUserId: input.actorUserId ?? null,
          deletionReason: input.reason?.trim() || null,
          deletionSource: input.source,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          name: 'Deleted User',
          email: tombstoneEmail,
          phone: null,
          passwordHash: randomBytes(32).toString('hex'),
          status: AccountStatus.INACTIVE,
          deletedAt: new Date(),
          deletedByUserId: input.actorUserId ?? null,
          deletionReason: input.reason?.trim() || null,
          deletionSource: input.source,
          suspendedAt: null,
          suspendedByUserId: null,
          suspensionReason: null,
          tokenVersion: { increment: 1 },
        },
      });

      await tx.session.updateMany({
        where: { userId: user.id, isRevoked: false },
        data: { isRevoked: true, revokedAt: new Date() },
      });

      return { id: user.id, deletedAt: new Date().toISOString() };
    });
  }
}
