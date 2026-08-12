// infrastructure/mappers/session.mapper.ts

import { Session as PrismaSession } from '@prisma/client';

import { Session } from '../../domain/entities/session.entity';

import { DeviceType } from '../../domain/enums/device-type.enum';
import { ClientType } from '../../domain/enums/client-type.enum';

export class SessionMapper {
  // =====================
  // 🔵 DB → DOMAIN
  // =====================

  static toDomain(record: PrismaSession): Session {
    return Session.reconstitute({
      id: record.id,

      userId: record.userId,

      refreshTokenHash: record.refreshTokenHash,

      clientType: (record.clientType as ClientType) ?? ClientType.UNKNOWN,

      userAgent: record.userAgent ?? null,
      ipAddress: record.ipAddress ?? null,

      deviceType: (record.deviceType as DeviceType) ?? DeviceType.UNKNOWN,

      fingerprint: record.fingerprint ?? null,

      isRevoked: record.isRevoked,
      revokedAt: record.revokedAt ?? null,

      lastUsedAt: record.lastUsedAt ?? null,

      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      expiresAt: record.expiresAt,
    });
  }

  // =====================
  // 🟢 DOMAIN → DB
  // =====================

  static toPersistence(session: Session) {
    return {
      id: session.id,

      userId: session.userId,

      refreshTokenHash: session.refreshTokenHash,

      clientType: session.clientType,

      userAgent: session.userAgent,
      ipAddress: session.ipAddress,

      deviceType: session.deviceType,

      fingerprint: session.fingerprint,

      isRevoked: session.isRevoked,
      revokedAt: session.revokedAt,

      lastUsedAt: session.lastUsedAt,

      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      expiresAt: session.expiresAt,
    };
  }
}
