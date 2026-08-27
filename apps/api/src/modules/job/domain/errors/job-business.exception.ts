import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class JobNotFoundException extends BaseException {
  constructor() {
    super(ERROR_CODES.JOB_NOT_FOUND, 'Job not found.', 404);
  }
}

export class JobAlreadyExistsException extends BaseException {
  constructor(message = 'Job already exists.') {
    super(ERROR_CODES.JOB_ALREADY_EXISTS, message, 409);
  }
}

export class JobInactiveException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.JOB_INACTIVE,
      'This position is currently not accepting applications.',
      400,
    );
  }
}

export class JobClosedException extends BaseException {
  constructor() {
    super(ERROR_CODES.JOB_CLOSED, 'Job is closed.', 400);
  }
}

export class JobDeletedException extends BaseException {
  constructor() {
    super(ERROR_CODES.JOB_DELETED, 'Job has been deleted.', 400);
  }
}

export class JobExpiredException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.JOB_EXPIRED,
      'This position is no longer accepting applications.',
      400,
    );
  }
}

export class JobNotPendingApprovalException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.VALIDATION_ERROR,
      'This job submission is not pending approval.',
      400,
    );
  }
}

export class JobHasApplicationsException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.JOB_HAS_APPLICATIONS,
      'Job has applications and cannot be permanently deleted.',
      400,
    );
  }
}

export class JobNotDeletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.VALIDATION_ERROR,
      'Job is not deleted.',
      400,
    );
  }
}
