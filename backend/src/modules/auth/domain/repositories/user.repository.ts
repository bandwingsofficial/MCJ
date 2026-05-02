// domain/repositories/user.repository.ts

import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import { Phone } from '../value-objects/phone.vo';

export interface UserRepository {
  // 🔐 persistence
  save(user: User): Promise<void>; // create OR update

  // 🔍 finders
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByPhone(phone: Phone): Promise<User | null>;

  // 🔥 existence checks (important for validation)
  existsByEmail(email: Email): Promise<boolean>;
  existsByPhone(phone: Phone): Promise<boolean>;

  // 🔐 targeted updates (optional but recommended)
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}