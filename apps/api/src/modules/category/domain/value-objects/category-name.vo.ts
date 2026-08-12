import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CategoryName {
  private constructor(
    private readonly value: string,
  ) {}

  static create(value: string): CategoryName {
    const normalized = value?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Category name is required',
        400,
      );
    }

    if (normalized.length > 120) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Category name must be less than 120 characters',
        400,
      );
    }

    return new CategoryName(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
