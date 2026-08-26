export class UnassignCourseFromBranchCommand {
  constructor(
    public readonly branchId: string,
    public readonly courseId: string,
  ) {}
}
