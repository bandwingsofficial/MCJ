import { Inject } from '@nestjs/common';

import { AUTH_TOKENS } from '../../auth.tokens';
import type { PasswordResetRepository } from '../../domain/repositories/password-reset.repository';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import { parsePasswordResetToken } from './password-reset-token.util';

export class ValidatePasswordResetTokenHandler {
  constructor(
    @Inject(AUTH_TOKENS.PASSWORD_RESET_REPOSITORY)
    private readonly resetRepo: PasswordResetRepository,
    @Inject(AUTH_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(tokenRaw: string): Promise<{ valid: boolean }> {
    const parsed = parsePasswordResetToken(tokenRaw);
    if (!parsed) {
      return { valid: false };
    }

    const token = await this.resetRepo.findById(parsed.id);
    if (!token || token.isUsed) {
      return { valid: false };
    }

    try {
      token.canBeUsed();
    } catch {
      return { valid: false };
    }

    const matches = await this.passwordHasher.compare(
      parsed.secret,
      token.otpHash,
    );

    return { valid: matches };
  }
}
