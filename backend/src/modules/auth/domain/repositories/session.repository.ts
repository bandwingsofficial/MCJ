// domain/repositories/session.repository.ts

import { Session } from '../entities/session.entity';

export interface SessionRepository {
  // 🔐 persistence
  save(session: Session): Promise<void>;
  update(session: Session): Promise<void>;

  // 🔍 finders
  findById(id: string): Promise<Session | null>;

  findByUserId(userId: string): Promise<Session[]>;

  // 🔥 IMPORTANT: direct hash lookup (better than userId+hash)
  findByRefreshTokenHash(hash: string): Promise<Session | null>;

  // 🔐 validate refresh token (optional but useful)
  findByUserIdAndHash(
    userId: string,
    refreshTokenHash: string,
  ): Promise<Session | null>;

  // 🔥 active session check (used in JwtStrategy)
  findActiveById(id: string): Promise<Session | null>;

  // 🔐 revoke operations
  revokeById(sessionId: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
}