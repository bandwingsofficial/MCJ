// src/modules/branch/domain/value-objects/branch-name.vo.ts

import { BaseException } from '@/common/exceptions/base.exception';
import { ERROR_CODES } from '@/common/constants/error-codes';

export class BranchName {
  private constructor(
    private readonly value: string,
  ) {}

  static create(value: string): BranchName {
    if (!value || !value.trim()) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Branch name is required',
        400,
      );
    }

    const normalized = value.trim();

    if (normalized.length < 2) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Branch name must be at least 2 characters',
        400,
        {
          branchName: value,
        },
      );
    }

    return new BranchName(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: BranchName): boolean {
    return this.value === other.value;
  }
}