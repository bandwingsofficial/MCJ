// src/modules/profile/application/update-profile/update-profile.handler.ts

import { Inject, Logger, Optional } from '@nestjs/common';

import { UpdateProfileCommand } from './update-profile.command';
import { UpdateProfileResult } from './update-profile.result';

import type { ProfileRepository } from '../../domain/repositories/profile.repository';

import { ProfileDomainService } from '../../domain/services/profile-domain.service';

import { DomainError } from '../../domain/errors/domain.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

import { ValidationError } from '../errors/validation.error';

import { PROFILE_TOKENS } from '../../profile.tokens';

import { SyncStudentFromProfileHandler } from '../../../student/application/sync-student-from-profile/sync-student-from-profile.handler';

export class UpdateProfileHandler {
  private readonly logger = new Logger(
    UpdateProfileHandler.name,
  );

  constructor(
    @Inject(PROFILE_TOKENS.PROFILE_REPOSITORY)
    private readonly profileRepo: ProfileRepository,

    private readonly domainService: ProfileDomainService,

    @Optional()
    private readonly syncStudentFromProfileHandler?: SyncStudentFromProfileHandler,
  ) {}
  async execute(
    command: UpdateProfileCommand,
  ): Promise<UpdateProfileResult> {
    try {
      this.logger.log(
        '✏️ Update profile request received',
      );

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
      // 3️⃣ UPDATE ENTITY
      // =====================

      if (command.firstName !== undefined) {
        profile.changeFirstName(
          command.firstName,
        );
      }

      if (command.lastName !== undefined) {
        profile.changeLastName(
          command.lastName,
        );
      }

      if (command.email !== undefined) {
        profile.changeEmail(command.email);
      }

      if (command.phone !== undefined) {
        profile.changePhone(command.phone);
      }

      if (command.gender !== undefined) {
        profile.changeGender(command.gender);
      }

      if (command.dob !== undefined) {
        profile.changeDob(command.dob);
      }

      if (
        command.profileImage !== undefined
      ) {
        profile.changeProfileImage(
          command.profileImage,
        );
      }

      if (command.bio !== undefined) {
        profile.changeBio(command.bio);
      }

      // ✅ PATCH SAFE ADDRESS UPDATE
      profile.updateAddress({
        addressLine1:
          command.addressLine1,

        addressLine2:
          command.addressLine2,

        city: command.city,

        state: command.state,

        country: command.country,

        postalCode:
          command.postalCode,
      });

      // =====================
      // 4️⃣ SAVE
      // =====================

      await this.profileRepo.save(profile);

      if (this.syncStudentFromProfileHandler) {
        await this.syncStudentFromProfileHandler.execute(
          profile,
        );
      }

      this.logger.log(        `✅ Profile updated: ${profile.id}`,
      );

      // =====================
      // 5️⃣ RESPONSE
      // =====================

      return new UpdateProfileResult(
        profile.id,

        profile.userId,

        profile.firstName?.getValue() ??
          null,

        profile.lastName?.getValue() ??
          null,

        profile.email,
        profile.phone,

        profile.gender,

        profile.dob?.getValue() ?? null,

        profile.profileImage?.getValue() ??
          null,

        profile.addressLine1,
        profile.addressLine2,

        profile.city,
        profile.state,
        profile.country,

        profile.postalCode?.getValue() ??
          null,

        profile.bio?.getValue() ?? null,

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