// application/session/list-sessions.handler.ts

import { Inject, Logger } from '@nestjs/common';

import { ListSessionsQuery } from './list-sessions.query';

import { ListSessionsResult, SessionDto } from './list-sessions.result';

import type { SessionRepository } from '../../domain/repositories/session.repository';

import { AUTH_TOKENS } from '../../auth.tokens';

import { ValidationError } from '../errors/validation.error';

import { ERROR_CODES } from '../../domain/errors/error-codes';

import { Session } from '../../domain/entities/session.entity';

export class ListSessionsHandler {
  private readonly logger = new Logger(ListSessionsHandler.name);

  constructor(
    @Inject(AUTH_TOKENS.SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,
  ) {}

  async execute(
    query: ListSessionsQuery,
    currentSessionId: string,
  ): Promise<ListSessionsResult> {
    // =====================
    // 1️⃣ VALIDATION
    // =====================

    if (!query.userId?.trim()) {
      throw new ValidationError(
        'UserId is required',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    // =====================
    // 2️⃣ FETCH ACTIVE
    // =====================

    const sessions = await this.sessionRepo.findActiveByUserId(query.userId);

    // =====================
    // 3️⃣ SORT
    // =====================

    sessions.sort((a, b) => {
      const aTime = a.lastUsedAt?.getTime() ?? a.createdAt.getTime();

      const bTime = b.lastUsedAt?.getTime() ?? b.createdAt.getTime();

      return bTime - aTime;
    });

    // =====================
    // 4️⃣ MAP DTO
    // =====================

    const result = sessions.map(
      (session) =>
        new SessionDto(
          session.id,

          this.formatDevice(session),

          session.ipAddress,

          session.id === currentSessionId,

          session.createdAt,

          session.lastUsedAt,

          session.expiresAt,
        ),
    );

    this.logger.log(`📱 Active sessions fetched for user: ${query.userId}`);

    return new ListSessionsResult(result);
  }

  // =====================
  // 🧠 DEVICE FORMATTER
  // =====================

  private formatDevice(session: Session): string {
    const userAgent = session.userAgent?.toLowerCase() ?? '';

    let browser = 'Unknown Browser';

    // 🌐 browser detection
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      browser = 'Chrome';
    } else if (userAgent.includes('firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('edg')) {
      browser = 'Edge';
    } else if (userAgent.includes('opera')) {
      browser = 'Opera';
    }

    // 📱 device label
    const device = session.deviceType ?? 'UNKNOWN';

    return `${browser} on ${device}`;
  }
}
