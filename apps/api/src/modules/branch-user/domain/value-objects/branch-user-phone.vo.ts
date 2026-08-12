import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

export class BranchUserPhone {
  private constructor(
    private readonly value: string,
  ) {}

  static create(value: string): BranchUserPhone {
    if (!value || !value.trim()) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Phone number is required',
        400,
      );
    }

    const normalized = value.replace(/\s|-/g, '');

    if (!/^[0-9]{10,15}$/.test(normalized)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid phone number format',
        400,
      );
    }

    return new BranchUserPhone(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
