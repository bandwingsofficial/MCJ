import { EnrollmentStatus, Prisma } from '@prisma/client';

export const FACULTY_VISIBLE_ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.ACTIVE,
];

/** Matches Admin batch list: `BranchBatch` rows from Branch Management. */
export function branchAssignedBatchWhere(
  branchId: string,
): Prisma.BatchWhereInput {
  return {
    branchAssignments: { some: { branchId } },
  };
}

export function facultyBranchBatchWhere(
  branchId: string,
  batchIds?: string[] | null,
): Prisma.BatchWhereInput {
  return {
    isDeleted: false,
    ...branchAssignedBatchWhere(branchId),
    ...(batchIds ? { id: { in: batchIds } } : {}),
  };
}

/**
 * Branch Portal enrollments follow Admin Branch Management:
 * `Enrollment.branchId` plus batch still assigned via `BranchBatch`.
 */
export function facultyBranchEnrollmentWhere(
  branchId: string,
  options?: {
    batchId?: string;
    batchIds?: string[] | null;
    studentId?: string;
  },
): Prisma.EnrollmentWhereInput {
  return {
    isDeleted: false,
    branchId,
    student: { isDeleted: false },
    ...(options?.studentId ? { studentId: options.studentId } : {}),
    ...(options?.batchId ? { batchId: options.batchId } : {}),
    batch: facultyBranchBatchWhere(branchId, options?.batchIds),
  };
}

export function facultyBatchStudentWhere(
  batchId: string,
  branchId: string,
): Prisma.EnrollmentWhereInput {
  return {
    ...facultyBranchEnrollmentWhere(branchId, { batchId }),
    status: { in: FACULTY_VISIBLE_ENROLLMENT_STATUSES },
  };
}

/** ADMITTED students assigned to one batch timing (Take Attendance sheet). */
export function facultyBatchTimingStudentWhere(
  batchId: string,
  batchTimingId: string,
  branchId: string,
): Prisma.EnrollmentWhereInput {
  return {
    ...facultyBranchEnrollmentWhere(branchId, { batchId }),
    batchTimingId,
    status: EnrollmentStatus.ADMITTED,
  };
}

/** Active/admitted students assigned to one batch timing. */
export function facultyBatchTimingActiveStudentWhere(
  batchId: string,
  batchTimingId: string,
  branchId: string,
): Prisma.EnrollmentWhereInput {
  return {
    ...facultyBranchEnrollmentWhere(branchId, { batchId }),
    batchTimingId,
    status: { in: FACULTY_VISIBLE_ENROLLMENT_STATUSES },
  };
}
