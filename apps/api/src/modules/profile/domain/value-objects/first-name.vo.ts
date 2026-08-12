// src/modules/profile/domain/value-objects/first-name.vo.ts

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class FirstName {
  private constructor(private readonly value: string) {}

  static create(value: string): FirstName {
    if (!value || !value.trim()) {
      throw new DomainError(
        ERROR_CODES.PROFILE_INVALID_FIRST_NAME,
        'First name is required',
      );
    }

    const normalized = value.trim();

    if (normalized.length < 2 || normalized.length > 50) {
      throw new DomainError(
        ERROR_CODES.PROFILE_INVALID_FIRST_NAME,
        'First name must be between 2 and 50 characters',
      );
    }

    return new FirstName(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: FirstName): boolean {
    return this.value === other.value;
  }
}