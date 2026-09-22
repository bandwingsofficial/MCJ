export class UnassignBranchTrainerAssignmentCommand {
  constructor(
    public readonly branchId: string,
    public readonly assignmentId: string,
  ) {}
}
