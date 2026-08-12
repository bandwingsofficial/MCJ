// infrastructure/mappers/audit-log.mapper.ts

import {
  Prisma,
  AuditLog as PrismaAuditLog,
  AuditAction as PrismaAuditAction,
  DeviceType as PrismaDeviceType,
} from '@prisma/client';

import { AuditLog } from '../../domain/entities/audit-log.entity';

import { AuditAction } from '../../domain/enums/audit-action.enum';
import { DeviceType } from '../../domain/enums/device-type.enum';

export class AuditLogMapper {
  // =====================
  // 🔵 DB → DOMAIN
  // =====================

  static toDomain(record: PrismaAuditLog): AuditLog {
    return AuditLog.reconstitute({
      id: record.id,

      userId: record.userId,

      action: record.action as AuditAction,

      sessionId: record.sessionId,

      ipAddress: record.ipAddress,
      userAgent: record.userAgent,

      deviceType: (record.deviceType as DeviceType) ?? DeviceType.UNKNOWN,

      metadata: (record.metadata as Record<string, unknown> | null) ?? null,

      createdAt: record.createdAt,
    });
  }

  // =====================
  // 🟢 DOMAIN → DB
  // =====================

  static toPersistence(log: AuditLog) {
    return {
      id: log.id,

      userId: log.userId,

      action: log.action as PrismaAuditAction,

      sessionId: log.sessionId,

      ipAddress: log.ipAddress,
      userAgent: log.userAgent,

      deviceType: log.deviceType as PrismaDeviceType,

      metadata:
        log.metadata !== undefined && log.metadata !== null
          ? (log.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,

      createdAt: log.createdAt,
    };
  }
}
