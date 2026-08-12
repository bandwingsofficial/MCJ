import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class BatchCode {
  private constructor(private readonly value: string) {}

  static create(value: string): BatchCode {
    const normalized = value?.trim().toUpperCase();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Batch code is required',
        400,
      );
    }

    if (!/^[A-Z0-9-_]{2,60}$/.test(normalized)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid batch code',
        400,
      );
    }

    return new BatchCode(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
