import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class StudentCode {
  private constructor(private readonly value: string) {}

  static create(value: string): StudentCode {
    const normalized = value?.trim().toUpperCase();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Student code is required',
        400,
      );
    }

    if (!/^[A-Z0-9-_]{2,60}$/.test(normalized)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid student code',
        400,
      );
    }

    return new StudentCode(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
