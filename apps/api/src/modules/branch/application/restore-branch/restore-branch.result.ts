// src/modules/branch/application/restore-branch/restore-branch.result.ts

import { BranchStatus } from '../../domain/enums/branch-status.enum';

export class RestoreBranchResult {
  constructor(
    public readonly id: string,
    public readonly branchName: string,
    public readonly branchCode: string,
    public readonly status: BranchStatus,
    public readonly description: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}