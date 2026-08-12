import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CompanyName {
  private constructor(private readonly value: string) {}

  static create(value: string): CompanyName {
    const normalized = value?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Company name is required',
        400,
      );
    }

    if (normalized.length > 160) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Company name must be less than 160 characters',
        400,
      );
    }

    return new CompanyName(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
