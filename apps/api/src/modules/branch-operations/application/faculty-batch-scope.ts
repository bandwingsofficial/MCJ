import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';

/**
 * Faculty visibility:
 * - No BatchFaculty rows → all batches of the authenticated branch
 *   (Admin assigns batches to a branch via Batch.branchId; that is the source of truth.)
 * - One or more BatchFaculty rows → only those assigned batches.
 * Branch Manager / staff always see all batches of their branch.
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
