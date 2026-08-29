import { ERROR_CODES } from '@common/constants/error-codes';
import type { ErrorCode } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { EnrollmentDetailView } from '../repositories/enrollment.repository';

export interface ExistingEnrollmentMeta {
  enrollmentId: string;
  status: string;
  student?: {
    id: string;
    studentCode: string;
    firstName: string;
    lastName: string | null;
  };
  branch?: {
    id: string;
    branchName: string;
    branchCode: string;
  };
  batch?: {
    id: string;
    name: string;
    code: string;
  };
  course?: {
    id: string;
    title: string;
  };
}

export class EnrollmentAlreadyExistsException extends BaseException {
  constructor(
    code: ErrorCode = ERROR_CODES.STUDENT_ALREADY_ENROLLED,
    message = 'Student is already actively enrolled. A student can have only one active enrollment at a time.',
    metadata?: Record<string, unknown>,
  ) {
    super(code, message, 409, metadata);
  }

  static forCurrentEnrollment(
    detail: EnrollmentDetailView,
    intendedBatchId?: string,
  ): EnrollmentAlreadyExistsException {
    const branchName = detail.branch.branchName.trim();
    const batchName = detail.batch.name.trim();
    const sameBatch = intendedBatchId === detail.batch.id;
    const message = sameBatch
      ? `Student is already actively enrolled in ${branchName} - ${batchName} batch. A student can have only one active enrollment at a time.`
      : `Student is already actively enrolled in ${branchName} - ${batchName} batch. A student can have only one active enrollment at a time.`;

    return new EnrollmentAlreadyExistsException(
      ERROR_CODES.STUDENT_ALREADY_ENROLLED,
      message,
      {
        existingEnrollment: toExistingEnrollmentMeta(detail),
      },
    );
  }
}

export function toExistingEnrollmentMeta(
  detail: EnrollmentDetailView,
): ExistingEnrollmentMeta {
  return {
    enrollmentId: detail.id,
    status: detail.status,
    student: {
      id: detail.student.id,
      studentCode: detail.student.studentCode,
      firstName: detail.student.firstName,
      lastName: detail.student.lastName,
    },
    branch: {
      id: detail.branch.id,
      branchName: detail.branch.branchName,
      branchCode: detail.branch.branchCode,
    },
    batch: {
      id: detail.batch.id,
      name: detail.batch.name,
      code: detail.batch.code,
    },
    course: {
      id: detail.course.id,
      title: detail.course.title,
    },
  };
}
