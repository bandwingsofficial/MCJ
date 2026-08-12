// src/modules/branch/domain/value-objects/branch-email.vo.ts

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

export class BranchEmail {
  private constructor(
    private readonly value: string,
  ) {}

  static create(value: string): BranchEmail {
    if (!value || !value.trim()) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Branch email is required',
        400,
      );
    }

    const normalized = value
      .trim()
      .toLowerCase();

    const isValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalized,
      );

    if (!isValid) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid branch email format',
        400,
        {
          email: value,
        },
      );
    }

    return new BranchEmail(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: BranchEmail): boolean {
    return this.value === other.value;
  }
}