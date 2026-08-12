// domain/value-objects/phone.vo.ts

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class Phone {
  private constructor(private readonly value: string) {}

  static create(value: string): Phone {
    if (!value) {
      throw new DomainError(
        ERROR_CODES.USER_INVALID_PHONE,
        'Phone number is required',
      );
    }

    // 🟢 normalize (remove spaces, dashes, etc.)
    const normalized = value.replace(/\s|-/g, '');

    // 🟢 basic validation (India + general)
    const isValid = /^(\+91)?[6-9]\d{9}$/.test(normalized);

    if (!isValid) {
      throw new DomainError(
        ERROR_CODES.USER_INVALID_PHONE,
        'Invalid phone number format',
        { phone: value },
      );
    }

    return new Phone(normalized);
  }

  getValue(): string {
    return this.value;
  }

  // 🟢 optional (DDD best practice)
  equals(other: Phone): boolean {
    return this.value === other.value;
  }
}
