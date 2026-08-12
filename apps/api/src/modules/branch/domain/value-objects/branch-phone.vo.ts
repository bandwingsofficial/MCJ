// src/modules/branch/domain/value-objects/branch-phone.vo.ts

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

export class BranchPhone {
  private constructor(
    private readonly value: string,
  ) {}

  static create(value: string): BranchPhone {
    if (!value || !value.trim()) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Branch phone is required',
        400,
      );
    }

    const normalized = value.trim();

    const isValid =
      /^[0-9]{10,15}$/.test(normalized);

    if (!isValid) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid branch phone number',
        400,
        {
          phone: value,
        },
      );
    }

    return new BranchPhone(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: BranchPhone): boolean {
    return this.value === other.value;
  }
}