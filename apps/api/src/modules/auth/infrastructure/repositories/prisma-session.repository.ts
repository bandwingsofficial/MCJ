// infrastructure/repositories/prisma-session.repository.ts

import { Logger } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import type { SessionRepository } from '../../domain/repositories/session.repository';

import { Session } from '../../domain/entities/session.entity';

import { SessionMapper } from '../mappers/session.mapper';

export class PrismaSessionRepository implements SessionRepository {
  private readonly logger = new Logger(PrismaSessionRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // =====================
  // 💾 PERSISTENCE
  // =====================

  async save(session: Session): Promise<void> {
    const data = SessionMapper.toPersistence(session);

    await this.prisma.session.create({
      data,
    });
  }

  async update(session: Session): Promise<void> {
    const data = SessionMapper.toPersistence(session);

    await this.prisma.session.update({
      where: { id: session.id },

      data: {
        ...data,
      },
    });
  }

  async delete(sessionId: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  // =====================
  // 🔍 FINDERS
  // =====================

  async findById(id: string): Promise<Session | null> {
    const record = await this.prisma.session.findUnique({
      where: { id },
    });

    return record ? SessionMapper.toDomain(record) : null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const records = await this.prisma.session.findMany({
      where: { userId },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map((record) => SessionMapper.toDomain(record));
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    const records = await this.prisma.session.findMany({
      where: {
        userId,

        isRevoked: false,

        expiresAt: {
          gt: new Date(),
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map((record) => SessionMapper.toDomain(record));
  }

  async findByRefreshTokenHash(hash: string): Promise<Session | null> {
    const record = await this.prisma.session.findUnique({
      where: {
        refreshTokenHash: hash,
      },
    });

    return record ? SessionMapper.toDomain(record) : null;
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

    return record ? SessionMapper.toDomain(record) : null;
  }

  async findActiveById(id: string): Promise<Session | null> {
    const record = await this.prisma.session.findFirst({
      where: {
        id,

        isRevoked: false,

        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return record ? SessionMapper.toDomain(record) : null;
  }

  // =====================
  // 🔐 REVOKE
  // =====================

  async revokeById(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },

      data: {
        isRevoked: true,
        revokedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
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

  async revokeAllExcept(
    userId: string,
    currentSessionId: string,
  ): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId,

        id: {
          not: currentSessionId,
        },

        isRevoked: false,
      },

      data: {
        isRevoked: true,
        revokedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async rotateIfHashMatches(params: {
    sessionId: string;
    expectedHash: string;
    newHash: string;
    expiresAt: Date;
    fingerprint?: string | null;
  }): Promise<boolean> {
    const now = new Date();

    const result = await this.prisma.session.updateMany({
      where: {
        id: params.sessionId,
        refreshTokenHash: params.expectedHash,
        isRevoked: false,
        expiresAt: {
          gt: now,
        },
      },
      data: {
        refreshTokenHash: params.newHash,
        expiresAt: params.expiresAt,
        lastUsedAt: now,
        updatedAt: now,
        ...(params.fingerprint !== undefined
          ? { fingerprint: params.fingerprint }
          : {}),
      },
    });

    return result.count === 1;
  }

  // =====================
  // 🧠 SESSION ACTIVITY
  // =====================

  async updateLastUsedAt(sessionId: string, date: Date): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },

      data: {
        lastUsedAt: date,
        updatedAt: new Date(),
      },
    });
  }

  async existsActiveSession(sessionId: string): Promise<boolean> {
    const count = await this.prisma.session.count({
      where: {
        id: sessionId,

        isRevoked: false,

        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return count > 0;
  }

  async countActiveSessions(userId: string): Promise<number> {
    return this.prisma.session.count({
      where: {
        userId,

        isRevoked: false,

        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  // =====================
  // 🧹 CLEANUP
  // =====================

  async deleteExpiredSessions(): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  async deleteRevokedSessionsOlderThan(date: Date): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        isRevoked: true,

        revokedAt: {
          lt: date,
        },
      },
    });
  }
}
