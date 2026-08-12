import { BranchStatus } from '../../domain/enums/branch-status.enum';

export class UpdateBranchStatusResult {
  constructor(
    public readonly id: string,

    public readonly branchName: string,

    public readonly branchCode: string,

    public readonly status: BranchStatus,

    public readonly updatedAt: Date,
  ) {}
}
