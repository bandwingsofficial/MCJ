// src/modules/profile/domain/value-objects/bio.vo.ts

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class Bio {
  private constructor(private readonly value: string) {}

  static create(value: string): Bio {
    const normalized = value.trim();

    if (normalized.length > 300) {
      throw new DomainError(
        ERROR_CODES.PROFILE_INVALID_BIO,
        'Bio cannot exceed 300 characters',
      );
    }

    return new Bio(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Bio): boolean {
    return this.value === other.value;
  }
}