import { ERROR_CODES } from '@common/constants/error-codes';
import type { ErrorCode } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class EnrollmentAlreadyExistsException extends BaseException {
  constructor(
    code: ErrorCode = ERROR_CODES.STUDENT_ALREADY_ENROLLED,
    message = 'Student is already enrolled in this batch.',
  ) {
    super(code, message, 400);
  }
}
