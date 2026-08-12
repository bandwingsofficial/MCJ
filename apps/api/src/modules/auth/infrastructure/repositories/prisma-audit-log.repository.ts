// infrastructure/repositories/prisma-audit-log.repository.ts

import { Logger } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditAction } from '../../domain/enums/audit-action.enum';

import { AuditAction as PrismaAuditAction } from '@prisma/client';

import { AuditLogMapper } from '../mappers/audit-log.mapper';

export class PrismaAuditLogRepository implements AuditLogRepository {
  private readonly logger = new Logger(PrismaAuditLogRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // =====================
  // 🟢 WRITE
  // =====================

  async create(log: AuditLog): Promise<void> {
    const data = AuditLogMapper.toPersistence(log);

    await this.prisma.auditLog.create({
      data,
    });
  }

  // =====================
  // 🔍 READ
  // =====================

  async findById(id: string): Promise<AuditLog | null> {
    const record = await this.prisma.auditLog.findUnique({
      where: { id },
    });

    return record ? AuditLogMapper.toDomain(record) : null;
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      where: { userId },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map((record) => AuditLogMapper.toDomain(record));
  }

  async findByUserIdAndAction(
    userId: string,
    action: AuditAction,
  ): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      where: {
        userId,
        action: action as PrismaAuditAction,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map((record) => AuditLogMapper.toDomain(record));
  }

  async findBySessionId(sessionId: string): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      where: { sessionId },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map((record) => AuditLogMapper.toDomain(record));
  }

  async findSecurityEventsByUserId(userId: string): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      where: {
        userId,

        action: {
          in: [
            AuditAction.LOGIN_FAILED,
            AuditAction.SESSION_REVOKED,
            AuditAction.PASSWORD_RESET_FAILED,
            AuditAction.MFA_FAILED,
            AuditAction.ADMIN_LOGIN_FAILED,
          ],
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map((record) => AuditLogMapper.toDomain(record));
  }

  async findByUserIdPaginated(params: {
    userId: string;
    limit: number;
    cursor?: string;
  }): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      where: {
        userId: params.userId,
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: params.limit,

      ...(params.cursor && {
        cursor: {
          id: params.cursor,
        },

        skip: 1,
      }),
    });

    return records.map((record) => AuditLogMapper.toDomain(record));
  }

  async findRecent(limit: number): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },

      take: limit,
    });

    return records.map((record) => AuditLogMapper.toDomain(record));
  }

  async findByAction(action: AuditAction, limit: number): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      where: { action: action as PrismaAuditAction },

      orderBy: {
        createdAt: 'desc',
      },

      take: limit,
    });

    return records.map((record) => AuditLogMapper.toDomain(record));
  }

  // =====================
  // 🧠 ANALYTICS
  // =====================

  async countByUserIdAndAction(params: {
    userId: string;
    action: AuditAction;
    since?: Date;
  }): Promise<number> {
    return this.prisma.auditLog.count({
      where: {
        userId: params.userId,

        action: params.action as PrismaAuditAction,

        ...(params.since && {
          createdAt: {
            gte: params.since,
          },
        }),
      },
    });
  }

  async hasRecentSecurityEvent(params: {
    userId: string;
    action: AuditAction;
    since: Date;
  }): Promise<boolean> {
    const count = await this.prisma.auditLog.count({
      where: {
        userId: params.userId,

        action: params.action as PrismaAuditAction,

        createdAt: {
          gte: params.since,
        },
      },
    });

    return count > 0;
  }

  // =====================
  // 🧹 CLEANUP
  // =====================

  async deleteOlderThan(date: Date): Promise<void> {
    await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: date,
        },
      },
    });
  }
}
