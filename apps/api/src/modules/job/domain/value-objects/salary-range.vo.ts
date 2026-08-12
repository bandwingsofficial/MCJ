import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class SalaryRange {
  private constructor(
    private readonly min: number | null,
    private readonly max: number | null,
    private readonly currency: string,
  ) {}

  static create(
    min?: number | null,
    max?: number | null,
    currency = 'INR',
  ): SalaryRange {
    const normalizedCurrency = currency?.trim() || 'INR';

    if (min !== null && min !== undefined && min < 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Minimum salary cannot be negative',
        400,
      );
    }

    if (max !== null && max !== undefined && max < 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Maximum salary cannot be negative',
        400,
      );
    }

    if (
      min !== null &&
      min !== undefined &&
      max !== null &&
      max !== undefined &&
      max < min
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Maximum salary cannot be less than minimum salary',
        400,
      );
    }

    return new SalaryRange(min ?? null, max ?? null, normalizedCurrency);
  }

  getMin(): number | null {
    return this.min;
  }

  getMax(): number | null {
    return this.max;
  }

  getCurrency(): string {
    return this.currency;
  }
}
