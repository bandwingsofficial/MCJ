// src/modules/profile/domain/value-objects/date-of-birth.vo.ts

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class DateOfBirth {
  private constructor(private readonly value: Date) {}

  static create(value: Date): DateOfBirth {
    const today = new Date();

    if (value > today) {
      throw new DomainError(
        ERROR_CODES.PROFILE_INVALID_DOB,
        'Date of birth cannot be in future',
      );
    }

    const age = today.getFullYear() - value.getFullYear();

    if (age < 13) {
      throw new DomainError(
        ERROR_CODES.PROFILE_INVALID_DOB,
        'User must be at least 13 years old',
      );
    }

    return new DateOfBirth(value);
  }

  getValue(): Date {
    return this.value;
  }

  equals(other: DateOfBirth): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}