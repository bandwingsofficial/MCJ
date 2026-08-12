import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class Slug {
  private constructor(
    private readonly value: string,
  ) {}

  static create(
    value: string,
    label = 'Slug',
  ): Slug {
    const normalized = Slug.normalize(value);

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        `${label} is required`,
        400,
      );
    }

    return new Slug(normalized);
  }

  static fromName(name: string): Slug {
    return Slug.create(name, 'Slug');
  }

  static fromTitle(title: string): Slug {
    return Slug.create(title, 'Slug');
  }

  static normalize(value: string): string {
    return value
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  getValue(): string {
    return this.value;
  }
}
