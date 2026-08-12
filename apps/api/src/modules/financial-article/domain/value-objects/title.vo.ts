import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Title {
  private constructor(private readonly value: string) {}

  static create(value: string): Title {
    const normalized = value?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Article title is required',
        400,
      );
    }

    if (normalized.length > 300) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Article title must be less than 300 characters',
        400,
      );
    }

    return new Title(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
