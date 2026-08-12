import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class MediaUrl {
  private constructor(private readonly value: string | null) {}

  static create(value?: string | null): MediaUrl {
    if (value === null || value === undefined || value === '') {
      return new MediaUrl(null);
    }

    const normalized = value.trim();

    try {
      new URL(normalized);
    } catch {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid media URL',
        400,
      );
    }

    return new MediaUrl(normalized);
  }

  getValue(): string | null {
    return this.value;
  }
}
