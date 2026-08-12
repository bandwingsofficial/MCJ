// domain/value-objects/email.vo.ts

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    if (!value) {
      throw new DomainError(
        ERROR_CODES.USER_INVALID_EMAIL,
        'Email is required',
      );
    }

    const normalized = value.trim().toLowerCase();

    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);

    if (!isValid) {
      throw new DomainError(
        ERROR_CODES.USER_INVALID_EMAIL,
        'Invalid email format',
        { email: value },
      );
    }

    return new Email(normalized);
  }

  getValue(): string {
    return this.value;
  }

  // 🟢 optional but powerful
  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
