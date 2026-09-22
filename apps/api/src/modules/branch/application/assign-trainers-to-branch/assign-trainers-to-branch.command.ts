import type { BranchTrainerAssignmentType } from '../../domain/repositories/branch.repository';

export class AssignTrainersToBranchCommand {
  constructor(
    public readonly branchId: string,
    public readonly trainerIds: string[],
    public readonly assignmentType: BranchTrainerAssignmentType = 'BRANCH_ONLY',
    public readonly courseId?: string,
    public readonly batchId?: string,
    public readonly mode?: string,
    public readonly batchTimingId?: string,
  ) {}
}
