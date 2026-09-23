import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Hashtag {
  private constructor(private readonly value: string) {}

  static create(value: string): Hashtag {
    const normalized = value?.trim().replace(/^#/, '');

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Hashtag cannot be empty',
        400,
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(normalized)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid hashtag format',
        400,
      );
    }

    if (normalized.length > 50) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Hashtag must be less than 50 characters',
        400,
      );
    }

    return new Hashtag(normalized.toLowerCase());
  }

  static createMany(values?: string[]): string[] {
    if (!values?.length) {
      return [];
    }

    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const value of values) {
      const tag = Hashtag.create(value).getValue();
      if (seen.has(tag)) {
        continue;
      }

      seen.add(tag);
      normalized.push(tag);
    }

    return normalized;
  }

  getValue(): string {
    return this.value;
  }
}
