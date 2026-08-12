import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { StudentPortalAccessReason } from '../enums/student-portal-access-reason.enum';

// All portal-access denials carry { allowed: false, reason } metadata so the
// frontend can act on a stable reason while still receiving a structured error.

export class StudentPortalAccessDeniedException extends BaseException {
  constructor(
    reason: StudentPortalAccessReason,
    message: string,
    statusCode = 403,
  ) {
    super(ERROR_CODES.STUDENT_PORTAL_ACCESS_DENIED, message, statusCode, {
      allowed: false,
      reason,
    });
  }
}

export class StudentPortalStudentNotFoundException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.STUDENT_PORTAL_STUDENT_NOT_FOUND,
      'Student profile not found.',
      404,
      {
        allowed: false,
        reason: StudentPortalAccessReason.STUDENT_PROFILE_NOT_FOUND,
      },
    );
  }
}

export class StudentPortalEnrollmentNotFoundException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.STUDENT_PORTAL_ENROLLMENT_NOT_FOUND,
      'No enrollment found.',
      404,
      {
        allowed: false,
        reason: StudentPortalAccessReason.NO_ENROLLMENT,
      },
    );
  }
}

export class StudentPortalStudentNotAdmittedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.STUDENT_PORTAL_STUDENT_NOT_ADMITTED,
      'Student is not admitted.',
      403,
      {
        allowed: false,
        reason: StudentPortalAccessReason.STUDENT_NOT_ADMITTED,
      },
    );
  }
}

export class StudentPortalEnrollmentNotAdmittedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.STUDENT_PORTAL_ENROLLMENT_NOT_ADMITTED,
      'Enrollment is not admitted.',
      403,
      {
        allowed: false,
        reason: StudentPortalAccessReason.ENROLLMENT_NOT_ADMITTED,
      },
    );
  }
}
