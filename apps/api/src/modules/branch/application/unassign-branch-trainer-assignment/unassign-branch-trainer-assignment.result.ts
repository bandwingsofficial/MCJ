export class UnassignBranchTrainerAssignmentResult {
  constructor(
    public readonly branchId: string,
    public readonly assignmentId: string,
    public readonly unassigned: boolean,
  ) {}
}
