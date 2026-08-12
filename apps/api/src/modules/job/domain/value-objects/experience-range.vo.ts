import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class ExperienceRange {
  private constructor(
    private readonly min: number | null,
    private readonly max: number | null,
  ) {}

  static create(
    min?: number | null,
    max?: number | null,
  ): ExperienceRange {
    if (min !== null && min !== undefined && min < 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Minimum experience cannot be negative',
        400,
      );
    }

    if (max !== null && max !== undefined && max < 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Maximum experience cannot be negative',
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
        'Maximum experience cannot be less than minimum experience',
        400,
      );
    }

    return new ExperienceRange(min ?? null, max ?? null);
  }

  getMin(): number | null {
    return this.min;
  }

  getMax(): number | null {
    return this.max;
  }
}
