import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CategoryNotFoundException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.CATEGORY_NOT_FOUND,
      'Category not found',
      404,
    );
  }
}
