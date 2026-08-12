export class UpdateBranchUserStatusCommand {
  constructor(
    public readonly branchUserId: string,
    public readonly isActive: boolean,
    public readonly updatedBy: string,
  ) {}
}
