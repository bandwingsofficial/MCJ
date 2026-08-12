import { Inject } from '@nestjs/common';

import { GetMeQuery } from './get-me.query';
import { GetMeResult } from './get-me.result';

import type { UserRepository } from '../../domain/repositories/user.repository';

import { UnauthorizedError } from '../errors/unauthorized.error';

import { ERROR_CODES } from '../../domain/errors/error-codes';

import { AUTH_TOKENS } from '../../auth.tokens';

export class GetMeHandler {
  constructor(
    @Inject(AUTH_TOKENS.USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}

  async execute(query: GetMeQuery): Promise<GetMeResult> {
    const user = await this.userRepo.findById(query.userId);

    if (!user) {
      throw new UnauthorizedError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    return new GetMeResult(
      user.id,
      user.email.getValue(),
      user.name,
      user.role,
      user.phone ? user.phone.getValue() : null,
      user.mfaEnabled,
      user.createdAt,
      query.sessionId,
    );
  }
}
