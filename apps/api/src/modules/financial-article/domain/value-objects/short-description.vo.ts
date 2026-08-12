import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class ShortDescription {
  private constructor(private readonly value: string | null) {}

  static create(value?: string | null): ShortDescription {
    if (value === undefined || value === null) {
      return new ShortDescription(null);
    }

    const normalized = value.trim();

    if (!normalized) {
      return new ShortDescription(null);
    }

    if (normalized.length > 500) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Short description must be less than 500 characters',
        400,
      );
    }

    return new ShortDescription(normalized);
  }

  getValue(): string | null {
    return this.value;
  }
}
