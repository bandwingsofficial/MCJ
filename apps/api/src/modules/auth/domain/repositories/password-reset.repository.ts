// domain/repositories/password-reset.repository.ts

import { PasswordResetToken } from '../entities/password-reset-token.entity';

export interface PasswordResetRepository {
  // =====================
  // 🔐 PERSISTENCE
  // =====================

  save(token: PasswordResetToken): Promise<void>;

  update(token: PasswordResetToken): Promise<void>;

  delete(id: string): Promise<void>;

  // =====================
  // 🔍 FINDERS
  // =====================

  findById(id: string): Promise<PasswordResetToken | null>;

  // 🔥 latest token strategy
  findLatestByUserId(userId: string): Promise<PasswordResetToken | null>;

  // 🔥 only active/usable token
  findLatestActiveByUserId(userId: string): Promise<PasswordResetToken | null>;

  // =====================
  // 🧠 VALIDATION HELPERS
  // =====================

  existsActiveToken(userId: string): Promise<boolean>;

  countRecentRequests(userId: string, since: Date): Promise<number>;

  // =====================
  // 🧹 CLEANUP
  // =====================

  deleteExpiredByUserId(userId: string): Promise<void>;

  deleteUsedTokensByUserId(userId: string): Promise<void>;

  deleteExpiredTokens(): Promise<void>;
}
