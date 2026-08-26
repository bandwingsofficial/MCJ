export class AssignCoursesToBranchCommand {
  constructor(
    public readonly branchId: string,
    public readonly courseIds: string[],
  ) {}
}
