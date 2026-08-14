import { BranchStatus } from '../../domain/enums/branch-status.enum';

export class BulkUpdateBranchStatusCommand {
  constructor(
    public readonly branchIds: string[],
    public readonly status: BranchStatus,
  ) {}
}