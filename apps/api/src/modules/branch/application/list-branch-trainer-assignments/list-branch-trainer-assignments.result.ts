import type { BranchTrainerAssignmentRecord } from '../../domain/repositories/branch.repository';

export class ListBranchTrainerAssignmentsResult {
  constructor(
    public readonly branchId: string,
    public readonly items: BranchTrainerAssignmentRecord[],
  ) {}
}
