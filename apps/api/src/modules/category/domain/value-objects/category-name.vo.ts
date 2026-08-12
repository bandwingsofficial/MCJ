import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CategoryName {
  private constructor(
    private readonly value: string,
  ) {}

  static create(value: string): CategoryName {
    const normalized = CategoryName.normalize(value);

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

  /** Trim + collapse internal whitespace for storage/uniqueness. */
  static normalize(value: string): string {
    return (value ?? '').trim().replace(/\s+/g, ' ');
  }

  /** Case-insensitive key used for uniqueness checks. */
  static uniquenessKey(value: string): string {
    return CategoryName.normalize(value).toLowerCase();
  }

  getValue(): string {
    return this.value;
  }
}
