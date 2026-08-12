import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Email {
  private constructor(
    private readonly value: string | null,
  ) {}

  static create(value?: string | null): Email {
    const normalized = value?.trim().toLowerCase() || null;

    if (
      normalized &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid trainer email',
        400,
      );
    }

    return new Email(normalized);
  }

  getValue(): string | null {
    return this.value;
  }
}
