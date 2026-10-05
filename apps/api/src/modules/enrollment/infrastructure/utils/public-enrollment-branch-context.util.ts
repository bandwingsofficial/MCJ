import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import type { CourseBatchTrainerAssignmentContext } from '@modules/branch/domain/repositories/branch.repository';
import {
  BatchBranchMismatchException,
  BatchCourseMismatchException,
  BatchNotFoundException,
  BranchNotFoundException,
} from '../../domain/errors/enrollment-business.exception';
function mapBranchContextError(error: unknown): never {
  if (!(error instanceof Error)) {
    throw error;
  }

  switch (error.message) {
    case 'BRANCH_COURSE_NOT_LINKED':
      throw new BatchCourseMismatchException();
    case 'BRANCH_BATCH_NOT_LINKED':
      throw new BatchBranchMismatchException();
    case 'BATCH_NOT_FOUND':
    case 'BATCH_TIMING_NOT_FOUND':
      throw new BatchNotFoundException();
    case 'BATCH_COURSE_MISMATCH':
      throw new BatchCourseMismatchException();
    case 'BATCH_TIMING_MODE_MISMATCH':
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Selected mode does not match the batch timing.',
        400,
      );
    case 'BATCH_NOT_UPCOMING':
    case 'BATCH_TIMING_NOT_UPCOMING':
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Only upcoming batches are available for enrollment.',
        400,
      );
    case 'BATCH_TIMING_INACTIVE':
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Selected batch timing is not available.',
        400,
      );
    default:
      throw error;
  }
}

export async function assertPublicEnrollmentBranchContext(
  branchRepo: BranchRepository,
  params: {
    branchId: string;
    courseId: string;
    batchId: string;
    batchTimingId: string;
    mode: string;
  },
): Promise<void> {
  if (!params.branchId?.trim()) {
    throw new BranchNotFoundException();
  }

  const context: CourseBatchTrainerAssignmentContext = {
    courseId: params.courseId,
    batchId: params.batchId,
    mode: params.mode,
    batchTimingId: params.batchTimingId,
  };

  try {
    await branchRepo.validatePublicCustomerEnrollmentContext(
      params.branchId,
      context,
    );
  } catch (error) {
    mapBranchContextError(error);
  }
}
