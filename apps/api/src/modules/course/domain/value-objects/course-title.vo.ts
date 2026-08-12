import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CourseTitle {
  private constructor(
    private readonly value: string,
  ) {}

  static create(value: string): CourseTitle {
    const normalized = value?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Course title is required',
        400,
      );
    }

    if (normalized.length > 160) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Course title must be less than 160 characters',
        400,
      );
    }

    return new CourseTitle(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
