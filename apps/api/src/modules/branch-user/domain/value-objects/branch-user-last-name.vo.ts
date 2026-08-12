import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

export class BranchUserLastName {
  private constructor(
    private readonly value: string,
  ) {}

  static create(
    value: string,
  ): BranchUserLastName {
    const normalized = value?.trim();

    if (!normalized || normalized.length < 2) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Last name must be at least 2 characters',
        400,
      );
    }

    return new BranchUserLastName(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
