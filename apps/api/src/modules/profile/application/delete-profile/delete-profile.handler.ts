// src/modules/profile/application/delete-profile/delete-profile.handler.ts

import { Inject, Logger } from '@nestjs/common';

import { DeleteProfileCommand } from './delete-profile.command';
import { DeleteProfileResult } from './delete-profile.result';

import type { ProfileRepository } from '../../domain/repositories/profile.repository';

import { ProfileDomainService } from '../../domain/services/profile-domain.service';

import { DomainError } from '../../domain/errors/domain.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

import { ValidationError } from '../errors/validation.error';

import { PROFILE_TOKENS } from '../../profile.tokens';

export class DeleteProfileHandler {
  private readonly logger = new Logger(
    DeleteProfileHandler.name,
  );

  constructor(
    @Inject(PROFILE_TOKENS.PROFILE_REPOSITORY)
    private readonly profileRepo: ProfileRepository,

    private readonly domainService: ProfileDomainService,
  ) {}

  async execute(
    command: DeleteProfileCommand,
  ): Promise<DeleteProfileResult> {
    try {
      this.logger.log('🗑️ Delete profile request received');

      // =====================
      // 1️⃣ VALIDATION
      // =====================

      if (!command.userId) {
        throw new ValidationError(
          'User id is required',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      // =====================
      // 2️⃣ FIND PROFILE
      // =====================

      const profile =
        await this.profileRepo.findByUserId(
          command.userId,
        );

      this.domainService.ensureProfileExists(
        profile,
      );

      // =====================
      // 3️⃣ DELETE PROFILE
      // =====================

      await this.profileRepo.delete(profile.id);

      this.logger.log(
        `✅ Profile deleted: ${profile.id}`,
      );

      // =====================
      // 4️⃣ RESPONSE
      // =====================

      return new DeleteProfileResult(
        true,
        'Profile deleted successfully',
      );
    } catch (error) {
      if (error instanceof DomainError) {
        throw new ValidationError(
          error.message,
          error.code,
        );
      }

      throw error;
    }
  }
}