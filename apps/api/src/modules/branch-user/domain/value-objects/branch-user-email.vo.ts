import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

export class BranchUserEmail {
  private constructor(
    private readonly value: string,
  ) {}

  static create(value: string): BranchUserEmail {
    if (!value || !value.trim()) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Email is required',
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
        'Invalid email format',
        400,
      );
    }

    return new BranchUserEmail(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
