import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

export class BranchUserFirstName {
  private constructor(
    private readonly value: string,
  ) {}

  static create(
    value: string,
  ): BranchUserFirstName {
    const normalized = value?.trim();

    if (!normalized || normalized.length < 2) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'First name must be at least 2 characters',
        400,
      );
    }

    return new BranchUserFirstName(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
