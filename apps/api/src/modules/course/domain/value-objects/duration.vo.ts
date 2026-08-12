import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Duration {
  private constructor(
    private readonly value: number | null,
  ) {}

  static create(value?: number | null): Duration {
    if (value === undefined || value === null) {
      return new Duration(null);
    }

    const normalized = Number(value);

    if (
      !Number.isInteger(normalized) ||
      normalized <= 0
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Duration must be a positive integer',
        400,
      );
    }

    return new Duration(normalized);
  }

  getValue(): number | null {
    return this.value;
  }
}
