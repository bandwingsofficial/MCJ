import type { BranchBlockingReferences } from '../../domain/repositories/branch.repository';

export function formatBranchBlockingMessage(
  refs: BranchBlockingReferences,
): string | null {
  const blockingParts: string[] = [];

  if (refs.branchUsers > 0) {
    blockingParts.push(
      `${refs.branchUsers} branch user${refs.branchUsers === 1 ? '' : 's'}`,
    );
  }

  if (refs.students > 0) {
    blockingParts.push(
      `${refs.students} student${refs.students === 1 ? '' : 's'}`,
    );
  }

  if (refs.trainers > 0) {
    blockingParts.push(
      `${refs.trainers} trainer${refs.trainers === 1 ? '' : 's'}`,
    );
  }

  if (refs.enrollments > 0) {
    blockingParts.push(
      `${refs.enrollments} enrollment${refs.enrollments === 1 ? '' : 's'}`,
    );
  }

  if (refs.batches > 0) {
    blockingParts.push(
      `${refs.batches} batch${refs.batches === 1 ? '' : 'es'}`,
    );
  }

  if (refs.categories > 0) {
    blockingParts.push(
      `${refs.categories} categor${refs.categories === 1 ? 'y' : 'ies'}`,
    );
  }

  if (refs.courseBranches > 0) {
    blockingParts.push(
      `${refs.courseBranches} course link${refs.courseBranches === 1 ? '' : 's'}`,
    );
  }

  if (blockingParts.length === 0) {
    return null;
  }

  return `Cannot permanently delete this branch because it is still linked to ${blockingParts.join(', ')}. Reassign or remove those records first.`;
}
