import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Content {
  private constructor(private readonly value: string | null) {}

  static create(value?: string | null): Content {
    if (value === undefined || value === null) {
      return new Content(null);
    }

    const normalized = value.trim();

    if (!normalized) {
      return new Content(null);
    }

    return new Content(normalized);
  }

  static createRequired(value: string): Content {
    const normalized = value?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Article content is required',
        400,
      );
    }

    return new Content(normalized);
  }

  getValue(): string | null {
    return this.value;
  }
}
