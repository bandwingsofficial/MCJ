// src/modules/profile/application/get-profile/get-profile.handler.ts

import { Inject, Logger } from '@nestjs/common';

import { GetProfileCommand } from './get-profile.command';
import { GetProfileResult } from './get-profile.result';

import type { ProfileRepository } from '../../domain/repositories/profile.repository';

import { ProfileDomainService } from '../../domain/services/profile-domain.service';

import { DomainError } from '../../domain/errors/domain.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

import { ValidationError } from '../errors/validation.error';

import { PROFILE_TOKENS } from '../../profile.tokens';

export class GetProfileHandler {
  private readonly logger = new Logger(
    GetProfileHandler.name,
  );

  constructor(
    @Inject(PROFILE_TOKENS.PROFILE_REPOSITORY)
    private readonly profileRepo: ProfileRepository,

    private readonly domainService: ProfileDomainService,
  ) {}

  async execute(
    command: GetProfileCommand,
  ): Promise<GetProfileResult> {
    try {
      this.logger.log('👤 Get profile request received');

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

      this.logger.log(
        `✅ Profile fetched: ${profile.id}`,
      );

      // =====================
      // 3️⃣ RESPONSE
      // =====================

      return new GetProfileResult(
        profile.id,

        profile.userId,

        profile.firstName?.getValue() ?? null,
        profile.lastName?.getValue() ?? null,

        profile.email,
        profile.phone,

        profile.gender,

        profile.dob?.getValue() ?? null,

        profile.profileImage?.getValue() ?? null,

        profile.addressLine1,
        profile.addressLine2,

        profile.city,
        profile.state,
        profile.country,

        profile.postalCode?.getValue() ?? null,

        profile.bio?.getValue() ?? null,

        profile.createdAt,
        profile.updatedAt,
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