import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class StudentName {
  private constructor(private readonly value: string) {}

  static create(value: string): StudentName {
    const normalized = value?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Student name is required',
        400,
      );
    }

    if (normalized.length > 80) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Student name must be less than 80 characters',
        400,
      );
    }

    return new StudentName(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
