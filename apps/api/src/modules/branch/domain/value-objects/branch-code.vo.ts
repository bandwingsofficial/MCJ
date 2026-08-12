// src/modules/branch/domain/value-objects/branch-code.vo.ts

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

export class BranchCode {
  private constructor(
    private readonly value: string,
  ) {}

  static create(value: string): BranchCode {
    if (!value || !value.trim()) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Branch code is required',
        400,
      );
    }

    const normalized = value
      .trim()
      .toUpperCase();

    const isValid = /^[A-Z0-9_-]{2,20}$/.test(
      normalized,
    );

    if (!isValid) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid branch code format',
        400,
        {
          branchCode: value,
        },
      );
    }

    return new BranchCode(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: BranchCode): boolean {
    return this.value === other.value;
  }
}