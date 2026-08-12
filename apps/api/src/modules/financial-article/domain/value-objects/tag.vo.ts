import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Tag {
  private constructor(private readonly value: string) {}

  static create(value: string): Tag {
    const normalized = value?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Tag cannot be empty',
        400,
      );
    }

    if (normalized.length > 50) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Tag must be less than 50 characters',
        400,
      );
    }

    return new Tag(normalized);
  }

  static createMany(values?: string[]): string[] {
    if (!values?.length) {
      return [];
    }

    return values.map((value) => Tag.create(value).getValue());
  }

  getValue(): string {
    return this.value;
  }
}
