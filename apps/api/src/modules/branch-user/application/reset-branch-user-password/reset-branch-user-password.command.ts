export class ResetBranchUserPasswordCommand {
  constructor(
    public readonly branchUserId: string,
    public readonly newPassword: string,
    public readonly updatedBy: string,
  ) {}
}
