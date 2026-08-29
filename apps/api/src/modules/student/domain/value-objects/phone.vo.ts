import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Phone {
  private constructor(private readonly value: string | null) {}

  static create(value?: string | null): Phone {
    const normalized =
      value?.replace(/[\s-]/g, '').trim() || null;

    if (
      normalized &&
      !/^\+?[0-9]{7,15}$/.test(normalized)
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Please enter a valid phone number.',
        400,
        { field: 'phone' },
      );
    }

    return new Phone(normalized);
  }

  getValue(): string | null {
    return this.value;
  }
}
