// infrastructure/repositories/prisma-session.repository.ts

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Session as PrismaSession } from '@prisma/client';
import { Logger } from '@nestjs/common';

import type { SessionRepository } from '../../domain/repositories/session.repository';
import { Session } from '../../domain/entities/session.entity';
import { DeviceType } from '../../domain/enums/device-type.enum';

export class PrismaSessionRepository implements SessionRepository {
  private readonly logger = new Logger(PrismaSessionRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // 🟢 Create new session
  async save(session: Session): Promise<void> {
    this.logger.log(`🟢 Creating session for user: ${session.userId}`);

    await this.prisma.session.create({
      data: {
        id: session.id,
        userId: session.userId,
        refreshTokenHash: session.refreshTokenHash,
        userAgent: session.userAgent ?? null,
        ipAddress: session.ipAddress ?? null,
        deviceType: session.deviceType,
        isRevoked: session.isRevoked,
        revokedAt: session.revokedAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        expiresAt: session.expiresAt,
      },
    });
  }

  async findById(id: string): Promise<Session | null> {
    const record = await this.prisma.session.findUnique({
      where: { id },
    });

    return record ? this.toDomain(record) : null;
  }

  // 🔥 active session only (used in JwtStrategy)
  async findActiveById(id: string): Promise<Session | null> {
    const record = await this.prisma.session.findFirst({
      where: {
        id,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const records = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => this.toDomain(r));
  }

  // 🔥 CRITICAL: used for refresh flow
  async findByRefreshTokenHash(hash: string): Promise<Session | null> {
    const record = await this.prisma.session.findUnique({
      where: { refreshTokenHash: hash },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByUserIdAndHash(
    userId: string,
    refreshTokenHash: string,
  ): Promise<Session | null> {
    const record = await this.prisma.session.findFirst({
      where: {
        userId,
        refreshTokenHash,
        isRevoked: false,
      },
    });

    return record ? this.toDomain(record) : null;
  }

  // 🔄 Persist changes (rotate / revoke)
  async update(session: Session): Promise<void> {
    this.logger.log(`🔄 Updating session: ${session.id}`);

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: session.refreshTokenHash,
        isRevoked: session.isRevoked,
        revokedAt: session.revokedAt,
        expiresAt: session.expiresAt,
        updatedAt: session.updatedAt,
      },
    });
  }

  // 🔐 revoke single session (logout)
  async revokeById(sessionId: string): Promise<void> {
    this.logger.log(`🔐 Revoking session: ${sessionId}`);

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // 🔥 Bulk revoke (logout all devices)
  async revokeAllByUserId(userId: string): Promise<void> {
    this.logger.log(`🔥 Revoking all sessions for user: ${userId}`);

    await this.prisma.session.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // =====================
  // 🧠 MAPPER
  // =====================

  private toDomain(record: PrismaSession): Session {
    return Session.reconstitute({
      id: record.id,
      userId: record.userId,
      refreshTokenHash: record.refreshTokenHash,
      userAgent: record.userAgent ?? null,
      ipAddress: record.ipAddress ?? null,
      deviceType: (record as any).deviceType ?? DeviceType.UNKNOWN,
      isRevoked: record.isRevoked,
      revokedAt: (record as any).revokedAt ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      expiresAt: record.expiresAt,
    });
  }
}