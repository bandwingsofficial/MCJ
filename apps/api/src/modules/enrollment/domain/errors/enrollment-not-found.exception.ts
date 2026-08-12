import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class EnrollmentNotFoundException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.ENROLLMENT_NOT_FOUND,
      'Enrollment not found.',
      404,
    );
  }
}
