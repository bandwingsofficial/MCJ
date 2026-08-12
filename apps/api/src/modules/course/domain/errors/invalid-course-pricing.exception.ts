import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class InvalidCoursePricingException extends BaseException {
  constructor(
    message = 'Invalid course pricing',
  ) {
    super(
      ERROR_CODES.INVALID_COURSE_PRICING,
      message,
      400,
    );
  }
}