// src/modules/profile/application/create-profile/create-profile.handler.ts

import { randomUUID } from 'crypto';

import { Inject, Logger } from '@nestjs/common';

import { CreateProfileCommand } from './create-profile.command';
import { CreateProfileResult } from './create-profile.result';

import type { ProfileRepository } from '../../domain/repositories/profile.repository';

import { Profile } from '../../domain/entities/profile.entity';

import { ProfileDomainService } from '../../domain/services/profile-domain.service';

import { DomainError } from '../../domain/errors/domain.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

import { ValidationError } from '../errors/validation.error';

import { PROFILE_TOKENS } from '../../profile.tokens';

export class CreateProfileHandler {
  private readonly logger = new Logger(
    CreateProfileHandler.name,
  );

  constructor(
    @Inject(PROFILE_TOKENS.PROFILE_REPOSITORY)
    private readonly profileRepo: ProfileRepository,

    private readonly domainService: ProfileDomainService,
  ) {}

  async execute(
    command: CreateProfileCommand,
  ): Promise<CreateProfileResult> {
    try {
      this.logger.log('👤 Create profile request received');

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
      // 2️⃣ CHECK EXISTING
      // =====================

      const existingProfile =
        await this.profileRepo.findByUserId(
          command.userId,
        );

      this.domainService.ensureProfileDoesNotExist(
        existingProfile,
      );

      // =====================
      // 3️⃣ CREATE ENTITY
      // =====================

      const profile = Profile.create({
        id: randomUUID(),

        userId: command.userId,

        firstName: command.firstName,
        lastName: command.lastName,

        email: command.email,
        phone: command.phone,

        gender: command.gender,

        dob: command.dob,

        profileImage: command.profileImage,

        addressLine1: command.addressLine1,
        addressLine2: command.addressLine2,

        city: command.city,
        state: command.state,
        country: command.country,

        postalCode: command.postalCode,

        bio: command.bio,
      });

      // =====================
      // 4️⃣ SAVE
      // =====================

      await this.profileRepo.save(profile);

      this.logger.log(
        `✅ Profile created: ${profile.id}`,
      );

      // =====================
      // 5️⃣ RESPONSE
      // =====================

      return new CreateProfileResult(
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