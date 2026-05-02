// domain/repositories/password-reset.repository.ts

import { PasswordResetToken } from '../entities/password-reset-token.entity';

export interface PasswordResetRepository {
  // 🟢 create new OTP record
  save(token: PasswordResetToken): Promise<void>;

  // 🔍 get latest valid reset token for user
  findLatestByUserId(userId: string): Promise<PasswordResetToken | null>;

  // 🔐 persist changes (markUsed, etc.)
  update(token: PasswordResetToken): Promise<void>;

  // 🔥 optional but useful: cleanup old tokens
  deleteExpiredByUserId(userId: string): Promise<void>;
}