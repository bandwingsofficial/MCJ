import { BranchStatus } from '../../domain/enums/branch-status.enum';

export class BulkUpdateBranchStatusResult {
  constructor(
    public readonly updated: number,
    public readonly status: BranchStatus,
  ) {}
}