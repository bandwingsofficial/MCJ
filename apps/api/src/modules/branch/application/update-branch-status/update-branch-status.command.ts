import { BranchStatus } from '../../domain/enums/branch-status.enum';

export class UpdateBranchStatusCommand {
  constructor(
    public readonly branchId: string,

    public readonly status: BranchStatus,
  ) {}
}
