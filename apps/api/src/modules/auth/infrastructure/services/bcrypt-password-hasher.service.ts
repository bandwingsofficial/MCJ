// infrastructure/services/bcrypt-password-hasher.service.ts

import * as bcrypt from 'bcrypt';

import { Injectable } from '@nestjs/common';

import type { PasswordHasherPort } from '../../application/ports/password-hasher.port';

@Injectable()
export class BcryptPasswordHasherService implements PasswordHasherPort {
  // 🔥 configurable later via env
  private static readonly SALT_ROUNDS = 10;

  // =====================
  // 🔐 HASH
  // =====================

  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, BcryptPasswordHasherService.SALT_ROUNDS);
  }

  // =====================
  // 🔍 COMPARE
  // =====================

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
