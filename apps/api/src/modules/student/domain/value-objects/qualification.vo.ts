import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Qualification {
  private constructor(private readonly value: string | null) {}

  static create(value?: string | null): Qualification {
    const normalized = value?.trim() || null;

    if (normalized && normalized.length > 200) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Qualification must be less than 200 characters',
        400,
      );
    }

    return new Qualification(normalized);
  }

  getValue(): string | null {
    return this.value;
  }
}
