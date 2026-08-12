// src/modules/profile/domain/value-objects/postal-code.vo.ts

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class PostalCode {
  private constructor(private readonly value: string) {}

  static create(value: string): PostalCode {
    const normalized = value.trim();

    const isValid = /^[1-9][0-9]{5}$/.test(normalized);

    if (!isValid) {
      throw new DomainError(
        ERROR_CODES.PROFILE_INVALID_POSTAL_CODE,
        'Invalid postal code',
      );
    }

    return new PostalCode(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PostalCode): boolean {
    return this.value === other.value;
  }
}