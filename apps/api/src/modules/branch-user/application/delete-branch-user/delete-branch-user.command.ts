export class DeleteBranchUserCommand {
  constructor(
    public readonly branchUserId: string,
    public readonly updatedBy: string,
  ) {}
}
