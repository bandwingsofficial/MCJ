import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class BatchName {
  private constructor(private readonly value: string) {}

  static create(value: string): BatchName {
    const normalized = value?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Batch name is required',
        400,
      );
    }

    if (normalized.length > 140) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Batch name must be less than 140 characters',
        400,
      );
    }

    return new BatchName(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
