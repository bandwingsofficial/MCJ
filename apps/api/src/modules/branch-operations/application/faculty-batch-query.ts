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

export function facultyBatchStudentWhere(
  batchId: string,
  branchId: string,
): Prisma.EnrollmentWhereInput {
  return {
    batchId,
    branchId,
    isDeleted: false,
    status: { in: FACULTY_VISIBLE_ENROLLMENT_STATUSES },
    student: { isDeleted: false },
  };
}
