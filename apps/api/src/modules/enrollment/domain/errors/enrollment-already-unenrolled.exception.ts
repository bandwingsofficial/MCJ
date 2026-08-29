import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class EnrollmentAlreadyUnenrolledException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.ENROLLMENT_ALREADY_UNENROLLED,
      'Student is already unenrolled.',
      409,
    );
  }
}
