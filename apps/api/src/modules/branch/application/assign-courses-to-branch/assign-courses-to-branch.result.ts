export class AssignCoursesToBranchResult {
  constructor(
    public readonly branchId: string,
    public readonly assignedCount: number,
    public readonly courseIds: string[],
  ) {}
}
