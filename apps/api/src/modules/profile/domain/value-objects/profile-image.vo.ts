// src/modules/profile/domain/value-objects/profile-image.vo.ts

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class ProfileImage {
  private constructor(private readonly value: string) {}

  static create(value: string): ProfileImage {
    try {
      new URL(value);
    } catch {
      throw new DomainError(
        ERROR_CODES.PROFILE_INVALID_IMAGE,
        'Invalid profile image URL',
      );
    }

    return new ProfileImage(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProfileImage): boolean {
    return this.value === other.value;
  }
}