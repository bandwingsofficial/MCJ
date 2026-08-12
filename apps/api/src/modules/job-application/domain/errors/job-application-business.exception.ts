import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class JobApplicationNotFoundException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.JOB_APPLICATION_NOT_FOUND,
      'Job application not found.',
      404,
    );
  }
}

export class JobAlreadyAppliedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.JOB_ALREADY_APPLIED,
      'You have already applied to this job.',
      409,
    );
  }
}

export class InvalidApplicationStatusTransitionException extends BaseException {
  constructor(from: string, to: string) {
    super(
      ERROR_CODES.INVALID_APPLICATION_STATUS_TRANSITION,
      `Invalid application status transition from ${from} to ${to}.`,
      400,
    );
  }
}

export class JobApplicationDeletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.JOB_APPLICATION_DELETED,
      'Job application has been deleted.',
      400,
    );
  }
}

export class JobApplicationNotDeletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.JOB_APPLICATION_NOT_DELETED,
      'Job application is not deleted.',
      400,
    );
  }
}
