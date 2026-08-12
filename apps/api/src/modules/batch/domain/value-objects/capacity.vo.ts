import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Capacity {
  private constructor(private readonly value: number) {}

  static create(value: number): Capacity {
    const normalized = Number(value);

    if (
      !Number.isInteger(normalized) ||
      normalized <= 0
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Batch capacity must be greater than 0',
        400,
      );
    }

    return new Capacity(normalized);
  }

  getValue(): number {
    return this.value;
  }
}
