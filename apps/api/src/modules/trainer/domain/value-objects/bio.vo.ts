import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Bio {
  private constructor(
    private readonly value: string | null,
  ) {}

  static create(value?: string | null): Bio {
    const normalized = value?.trim() || null;

    if (normalized && normalized.length > 2000) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Trainer bio must be less than 2000 characters',
        400,
      );
    }

    return new Bio(normalized);
  }

  getValue(): string | null {
    return this.value;
  }
}
