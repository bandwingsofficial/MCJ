export class AssignTrainersToBranchResult {
  constructor(
    public readonly branchId: string,
    public readonly assignedCount: number,
    public readonly trainerIds: string[],
  ) {}
}
