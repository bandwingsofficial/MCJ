export class UnassignTrainerFromBranchResult {
  constructor(
    public readonly branchId: string,
    public readonly trainerId: string,
    public readonly unassigned: boolean,
  ) {}
}
