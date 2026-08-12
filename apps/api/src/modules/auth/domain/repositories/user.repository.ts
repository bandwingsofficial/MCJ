// domain/repositories/user.repository.ts

import { User } from '../entities/user.entity';

import { Email } from '../value-objects/email.vo';
import { Phone } from '../value-objects/phone.vo';

export interface UserRepository {
  // =====================
  // 🔐 PERSISTENCE
  // =====================

  save(user: User): Promise<void>;

  delete(userId: string): Promise<void>;

  // =====================
  // 🔍 FINDERS
  // =====================

  findById(id: string): Promise<User | null>;

  findByEmail(email: Email): Promise<User | null>;

  findByPhone(phone: Phone): Promise<User | null>;

  // 🔥 admin/auth helpers
  findActiveByEmail(email: Email): Promise<User | null>;

  // =====================
  // ✅ EXISTENCE CHECKS
  // =====================

  existsById(id: string): Promise<boolean>;

  existsByEmail(email: Email): Promise<boolean>;

  existsByPhone(phone: Phone): Promise<boolean>;

  // =====================
  // 🔐 SECURITY OPERATIONS
  // =====================

  updatePassword(userId: string, passwordHash: string): Promise<void>;

  updateMfa(
    userId: string,
    params: {
      mfaEnabled: boolean;
      mfaSecret: string | null;
      mfaVerifiedAt: Date | null;
    },
  ): Promise<void>;

  incrementTokenVersion(userId: string): Promise<void>;

  // =====================
  // 🧠 ACCOUNT STATE
  // =====================

  updateLastLoginAt(userId: string, date: Date): Promise<void>;

  updateStatus(userId: string, status: User['status']): Promise<void>;
}
