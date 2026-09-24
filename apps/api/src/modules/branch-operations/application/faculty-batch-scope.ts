import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';

/**
 * Faculty (trainer-linked branch user) batch visibility:
 * - Branch Manager / staff → all batches assigned to the branch (BranchBatch).
 * - No explicit trainer batch scope → all branch-assigned batches.
 * - BranchTrainer COURSE_BATCH rows with batchId → only those batches.
 * Legacy BatchFaculty rows apply only when the user has no linkedTrainerId.
 */
export function resolveFacultyBatchScope(
  role: string,
  assignedBatchIds: string[],
): 'ALL_BRANCH' | { in: string[] } {
  if (role !== BranchUserRole.FACULTY) {
    return 'ALL_BRANCH';
  }

  if (!assignedBatchIds.length) {
    return 'ALL_BRANCH';
  }

  return { in: assignedBatchIds };
}
