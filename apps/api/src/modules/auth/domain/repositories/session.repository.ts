// domain/repositories/session.repository.ts

import { Session } from '../entities/session.entity';

export interface SessionRepository {
  // =====================
  // 🔐 PERSISTENCE
  // =====================

  save(session: Session): Promise<void>;

  update(session: Session): Promise<void>;

  delete(sessionId: string): Promise<void>;

  // =====================
  // 🔍 FINDERS
  // =====================

  findById(id: string): Promise<Session | null>;

  findByUserId(userId: string): Promise<Session[]>;

  // 🔥 refresh auth
  findByRefreshTokenHash(hash: string): Promise<Session | null>;

  findByUserIdAndHash(
    userId: string,
    refreshTokenHash: string,
  ): Promise<Session | null>;

  // 🔥 auth guards
  findActiveById(id: string): Promise<Session | null>;

  // 🔥 session analytics
  findActiveByUserId(userId: string): Promise<Session[]>;

  // =====================
  // 🔐 REVOKE OPERATIONS
  // =====================

  revokeById(sessionId: string): Promise<void>;

  revokeAllByUserId(userId: string): Promise<void>;

  revokeAllExcept(userId: string, currentSessionId: string): Promise<void>;

  /**
   * Atomically rotate refresh hash only if the expected current hash still matches.
   * Returns false when another refresh won the race or the session was revoked.
   */
  rotateIfHashMatches(params: {
    sessionId: string;
    expectedHash: string;
    newHash: string;
    expiresAt: Date;
    fingerprint?: string | null;
  }): Promise<boolean>;

  // =====================
  // 🧠 SESSION ACTIVITY
  // =====================

  updateLastUsedAt(sessionId: string, date: Date): Promise<void>;

  existsActiveSession(sessionId: string): Promise<boolean>;

  countActiveSessions(userId: string): Promise<number>;

  // =====================
  // 🧹 CLEANUP
  // =====================

  deleteExpiredSessions(): Promise<void>;

  deleteRevokedSessionsOlderThan(date: Date): Promise<void>;
}
