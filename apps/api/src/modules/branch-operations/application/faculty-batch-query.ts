import { EnrollmentStatus, Prisma } from '@prisma/client';

export const FACULTY_VISIBLE_ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.ACTIVE,
];

export function facultyBranchBatchWhere(
  branchId: string,
  batchIds?: string[] | null,
): Prisma.BatchWhereInput {
  return {
    branchId,
    isDeleted: false,
    ...(batchIds ? { id: { in: batchIds } } : {}),
  };
}

/**
 * Branch Portal enrollments follow Admin's source of truth:
 * Batch (in this branch) -> Enrollment -> Student
 *
 * Do not require Enrollment.branchId or Student.branchId to match.
 * Those fields can lag behind the batch assignment Admin uses.
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
