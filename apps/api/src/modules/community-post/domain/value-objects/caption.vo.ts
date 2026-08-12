import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Caption {
  private constructor(private readonly value: string | null) {}

  static create(value?: string | null): Caption {
    if (value === null || value === undefined || value === '') {
      return new Caption(null);
    }

    const normalized = value.trim();

    if (normalized.length > 2200) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Caption must be less than 2200 characters',
        400,
      );
    }

    return new Caption(normalized);
  }

  getValue(): string | null {
    return this.value;
  }
}
