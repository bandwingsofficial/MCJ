export class UnassignTrainerFromBranchCommand {
  constructor(
    public readonly branchId: string,
    public readonly trainerId: string,
  ) {}
}
