// infrastructure/repositories/prisma-audit-log.repository.ts

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Prisma, AuditLog as PrismaAuditLog } from '@prisma/client';
import { Logger } from '@nestjs/common';

import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditAction } from '../../domain/enums/audit-action.enum';
import { DeviceType } from '../../domain/enums/device-type.enum';

export class PrismaAuditLogRepository implements AuditLogRepository {
  private readonly logger = new Logger(PrismaAuditLogRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // 🟢 Create (append-only)
  async create(log: AuditLog): Promise<void> {
    this.logger.log(
      `📝 Audit log: ${log.action} (user: ${log.userId ?? 'anonymous'})`,
    );

    await this.prisma.auditLog.create({
      data: {
        id: log.id,
        userId: log.userId ?? null,
        action: log.action,
        sessionId: log.sessionId ?? null,
        ipAddress: log.ipAddress ?? null,
        userAgent: log.userAgent ?? null,
        deviceType: log.deviceType, // 🔥 NEW

        metadata:
          log.metadata !== undefined && log.metadata !== null
            ? (log.metadata as Prisma.InputJsonValue)
            : Prisma.JsonNull,

        createdAt: log.createdAt,
      },
    });
  }

  // =====================
  // 🔍 READ OPERATIONS
  // =====================

  async findByUserId(userId: string): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => this.toDomain(r));
  }

  async findByUserIdAndAction(
    userId: string,
    action: AuditAction,
  ): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      where: { userId, action },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => this.toDomain(r));
  }

  // 🔥 NEW: session-level tracing
  async findBySessionId(sessionId: string): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => this.toDomain(r));
  }

  // 🔥 NEW: security events
  async findSecurityEventsByUserId(userId: string): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      where: {
        userId,
        action: {
          in: [
            AuditAction.LOGIN_FAILED,
            AuditAction.SESSION_REVOKED,
            AuditAction.PASSWORD_RESET_FAILED,
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => this.toDomain(r));
  }

  // 🔥 NEW: pagination (cursor-based)
  async findByUserIdPaginated(params: {
  userId: string;
  limit: number;
  cursor?: string;
}): Promise<AuditLog[]> {
  const records = await this.prisma.auditLog.findMany({
    where: { userId: params.userId }, // ✅ FIX
    orderBy: { createdAt: 'desc' },
    take: params.limit,
    ...(params.cursor && {
      cursor: { id: params.cursor },
      skip: 1,
    }),
  });

  return records.map((r) => this.toDomain(r));
}

  async findRecent(limit: number): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return records.map((r) => this.toDomain(r));
  }

  // 🔥 NEW: admin filter
  async findByAction(
    action: AuditAction,
    limit: number,
  ): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return records.map((r) => this.toDomain(r));
  }

  // =====================
  // 🧠 MAPPER
  // =====================

  private toDomain(record: PrismaAuditLog): AuditLog {
    return AuditLog.reconstitute({
      id: record.id,
      userId: record.userId,
      action: record.action as AuditAction,
      sessionId: record.sessionId,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      deviceType: (record as any).deviceType ?? DeviceType.UNKNOWN, // 🔥 NEW
      metadata: record.metadata ?? null,
      createdAt: record.createdAt,
    });
  }
}