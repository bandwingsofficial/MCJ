// src/modules/profile/domain/services/profile-domain.service.ts

import { Profile } from '../entities/profile.entity';

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class ProfileDomainService {
  // 🔥 cross-entity / policy logic only

  ensureProfileDoesNotExist(profile: Profile | null): void {
    if (profile) {
      throw new DomainError(
        ERROR_CODES.PROFILE_ALREADY_EXISTS,
        'Profile already exists',
      );
    }
  }

  // 🔥 assertion function
  ensureProfileExists(
    profile: Profile | null,
  ): asserts profile is Profile {
    if (!profile) {
      throw new DomainError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
  }

  ensureAdultProfile(profile: Profile): void {
    if (!profile.isAdult()) {
      throw new DomainError(
        ERROR_CODES.PROFILE_INVALID_DOB,
        'User must be at least 18 years old',
        { profileId: profile.id },
      );
    }
  }

  ensureCompleteProfile(profile: Profile): void {
    const isComplete =
      profile.hasCompleteName() &&
      !!profile.gender &&
      !!profile.dob;

    if (!isComplete) {
      throw new DomainError(
        ERROR_CODES.VALIDATION_ERROR,
        'Profile is incomplete',
        { profileId: profile.id },
      );
    }
  }
}