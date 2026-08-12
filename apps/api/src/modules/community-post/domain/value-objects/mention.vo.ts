import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Mention {
  private constructor(private readonly value: string) {}

  static create(value: string): Mention {
    const normalized = value?.trim().replace(/^@/, '');

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Mention cannot be empty',
        400,
      );
    }

    if (normalized.length > 80) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Mention must be less than 80 characters',
        400,
      );
    }

    return new Mention(normalized);
  }

  static createMany(values?: string[]): string[] {
    if (!values?.length) {
      return [];
    }

    return values.map((value) => Mention.create(value).getValue());
  }

  getValue(): string {
    return this.value;
  }
}
