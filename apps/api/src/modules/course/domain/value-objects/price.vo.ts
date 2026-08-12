import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Price {
  private constructor(
    private readonly value: number,
  ) {}

  static create(value?: number | null): Price {
    const normalized = Number(value ?? 0);

    if (Number.isNaN(normalized) || normalized < 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Price must be a valid positive number',
        400,
      );
    }

    return new Price(Number(normalized.toFixed(2)));
  }

  getValue(): number {
    return this.value;
  }
}
