// application/session/list-sessions.handler.ts

import { Inject } from '@nestjs/common';

import { ListSessionsQuery } from './list-sessions.query';
import { ListSessionsResult, SessionDto } from './list-sessions.result';

import type { SessionRepository } from '../../domain/repositories/session.repository';

import { AUTH_TOKENS } from '../../auth.tokens';
import { ValidationError } from '../errors/validation.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

export class ListSessionsHandler {
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
    if (!query.userId) {
      throw new ValidationError(
        'UserId is required',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    // =====================
    // 2️⃣ FETCH SESSIONS
    // =====================
    const sessions = await this.sessionRepo.findByUserId(query.userId);

    // =====================
    // 3️⃣ FILTER ACTIVE (use domain)
    // =====================
    const activeSessions = sessions.filter((s) => s.isActive());

    // =====================
    // 4️⃣ SORT (latest first)
    // =====================
    activeSessions.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    // =====================
    // 5️⃣ MAP DTO
    // =====================
    const result = activeSessions.map(
      (s) =>
        new SessionDto(
          s.id,

          // 🔥 Use deviceType (more reliable than UA parsing)
          this.formatDevice(s),

          s.ipAddress,

          // 🔥 current session detection
          s.id === currentSessionId,

          s.createdAt,
          s.expiresAt,
        ),
    );

    return new ListSessionsResult(result);
  }

  // =====================
  // 🔥 DEVICE FORMATTER
  // =====================
  private formatDevice(s: any): string {
    if (s.userAgent) {
      // fallback to parser if available
      return `${s.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'} on ${
        s.deviceType ?? 'Unknown'
      }`;
    }

    return `Unknown device (${s.deviceType ?? 'UNKNOWN'})`;
  }
}