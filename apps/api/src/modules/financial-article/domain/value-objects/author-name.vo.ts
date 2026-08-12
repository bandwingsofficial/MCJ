import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class AuthorName {
  private static readonly DEFAULT = 'MCJ Team';

  private constructor(private readonly value: string) {}

  static create(value?: string | null): AuthorName {
    const normalized = value?.trim() || AuthorName.DEFAULT;

    if (normalized.length > 120) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Author name must be less than 120 characters',
        400,
      );
    }

    return new AuthorName(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
