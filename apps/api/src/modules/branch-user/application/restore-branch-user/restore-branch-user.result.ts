// src/modules/branch-user/application/restore-branch-user/restore-branch-user.result.ts

export class RestoreBranchUserResult {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly email: string,
    public readonly branchId: string,
    public readonly isActive: boolean,
    public readonly updatedAt: Date,
  ) {}
}