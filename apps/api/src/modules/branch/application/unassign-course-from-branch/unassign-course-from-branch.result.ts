export class UnassignCourseFromBranchResult {
  constructor(
    public readonly branchId: string,
    public readonly courseId: string,
    public readonly unassigned: boolean,
  ) {}
}
