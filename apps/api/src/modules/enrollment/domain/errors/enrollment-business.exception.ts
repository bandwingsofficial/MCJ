import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class StudentNotFoundException extends BaseException {
  constructor() {
    super(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found.', 404);
  }
}

export class StudentInactiveException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.STUDENT_INACTIVE,
      'Student is inactive. Activate the student before enrollment.',
      400,
    );
  }
}

export class StudentDeletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.STUDENT_DELETED,
      'Student has been deleted and cannot be enrolled.',
      400,
    );
  }
}

export class StudentDetailsRequiredException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.STUDENT_DETAILS_REQUIRED,
      'Student details are required to create a student before enrollment.',
      400,
    );
  }
}

export class EnrollmentBranchAccessDeniedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.BRANCH_ACCESS_DENIED,
      'Branch access denied.',
      403,
    );
  }
}

export class BranchInactiveException extends BaseException {
  constructor() {
    super(ERROR_CODES.BRANCH_INACTIVE, 'Branch is inactive.', 400);
  }
}

export class BranchNotFoundException extends BaseException {
  constructor() {
    super(ERROR_CODES.BRANCH_NOT_FOUND, 'Branch not found.', 404);
  }
}

export class BranchDeletedException extends BaseException {
  constructor() {
    super(ERROR_CODES.BRANCH_DELETED, 'Branch has been deleted.', 400);
  }
}

export class CategoryInactiveException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.CATEGORY_INACTIVE,
      'Category is inactive.',
      400,
    );
  }
}

export class CategoryNotFoundException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.CATEGORY_NOT_FOUND,
      'Category not found.',
      404,
    );
  }
}

export class CategoryDeletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.CATEGORY_DELETED,
      'Category has been deleted.',
      400,
    );
  }
}

export class CourseInactiveException extends BaseException {
  constructor() {
    super(ERROR_CODES.COURSE_INACTIVE, 'Course is inactive.', 400);
  }
}

export class CourseNotFoundException extends BaseException {
  constructor() {
    super(ERROR_CODES.COURSE_NOT_FOUND, 'Course not found.', 404);
  }
}

export class CourseDeletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.COURSE_DELETED,
      'Course has been deleted.',
      400,
    );
  }
}

export class CourseInDraftException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.COURSE_IN_DRAFT,
      'Course is currently in draft state and is not available for enrollment.',
      400,
    );
  }
}

export class CourseArchivedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.COURSE_ARCHIVED,
      'Course has been archived and no new enrollments are allowed.',
      400,
    );
  }
}

export class CourseNotAvailableException extends BaseException {
  constructor(message = 'Course is not available for enrollment.') {
    super(
      ERROR_CODES.COURSE_NOT_AVAILABLE,
      message,
      400,
    );
  }
}

export class BatchInactiveException extends BaseException {
  constructor() {
    super(ERROR_CODES.BATCH_INACTIVE, 'Batch is inactive.', 400);
  }
}

export class BatchNotFoundException extends BaseException {
  constructor() {
    super(ERROR_CODES.BATCH_NOT_FOUND, 'Batch not found.', 404);
  }
}

export class BatchDeletedException extends BaseException {
  constructor() {
    super(ERROR_CODES.BATCH_DELETED, 'Batch has been deleted.', 400);
  }
}

export class BatchCompletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.BATCH_COMPLETED,
      'Batch has already been completed. Enrollment is not allowed.',
      400,
    );
  }
}

export class BatchCancelledException extends BaseException {
  constructor() {
    super(ERROR_CODES.BATCH_CANCELLED, 'Batch has been cancelled.', 400);
  }
}

export class CourseCategoryMismatchException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.COURSE_CATEGORY_MISMATCH,
      'Course does not belong to the selected category.',
      400,
    );
  }
}

export class CategoryBranchMismatchException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.CATEGORY_BRANCH_MISMATCH,
      'Category does not belong to the selected branch.',
      400,
    );
  }
}

export class BatchCourseMismatchException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.BATCH_COURSE_MISMATCH,
      'Batch does not belong to the selected course.',
      400,
    );
  }
}

export class StudentBranchMismatchException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.STUDENT_BRANCH_MISMATCH,
      'Student belongs to a different branch.',
      400,
    );
  }
}

export class InvalidDiscountException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.INVALID_DISCOUNT,
      'Discount amount cannot exceed fee amount.',
      400,
    );
  }
}

export class InvalidPaymentAmountException extends BaseException {
  constructor(
    message = 'Paid amount cannot exceed final amount.',
  ) {
    super(ERROR_CODES.INVALID_PAYMENT_AMOUNT, message, 400);
  }
}

export class InvalidStatusTransitionException extends BaseException {
  constructor(from: string, to: string) {
    super(
      ERROR_CODES.INVALID_STATUS_TRANSITION,
      `Cannot change status from ${from} to ${to}.`,
      400,
    );
  }
}

export class EnrollmentDeletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.ENROLLMENT_DELETED,
      'Enrollment has been deleted.',
      400,
    );
  }
}

export class EnrollmentNotDeletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.ENROLLMENT_NOT_DELETED,
      'Only deleted enrollments can be permanently removed.',
      400,
    );
  }
}

export class RestoreBatchFullException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.RESTORE_BATCH_FULL,
      'Cannot restore enrollment because the batch is already full.',
      400,
    );
  }
}

export class InvalidEnrollmentNumberException extends BaseException {
  constructor(message = 'Enrollment number is invalid.') {
    super(ERROR_CODES.INVALID_ENROLLMENT_NUMBER, message, 400);
  }
}
