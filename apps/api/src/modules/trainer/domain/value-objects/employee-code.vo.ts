import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class EmployeeCode {
  private constructor(
    private readonly value: string | null,
  ) {}

  static create(value?: string | null): EmployeeCode {
    const normalized = value?.trim().toUpperCase() || null;

    if (
      normalized &&
      !/^[A-Z0-9-_]{2,40}$/.test(normalized)
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid employee code',
        400,
      );
    }

    return new EmployeeCode(normalized);
  }

  getValue(): string | null {
    return this.value;
  }
}
