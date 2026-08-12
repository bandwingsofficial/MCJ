import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class JobTitle {
  private constructor(private readonly value: string) {}

  static create(value: string): JobTitle {
    const normalized = value?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Job title is required',
        400,
      );
    }

    if (normalized.length > 200) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Job title must be less than 200 characters',
        400,
      );
    }

    return new JobTitle(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
