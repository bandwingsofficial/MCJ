import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Classroom {
  private constructor(private readonly value: string | null) {}

  static create(value?: string | null): Classroom {
    const normalized = value?.trim() || null;

    if (normalized && normalized.length > 120) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Classroom must be less than 120 characters',
        400,
      );
    }

    return new Classroom(normalized);
  }

  getValue(): string | null {
    return this.value;
  }
}
