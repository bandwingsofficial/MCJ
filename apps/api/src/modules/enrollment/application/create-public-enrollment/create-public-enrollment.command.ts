export class CreatePublicEnrollmentCommand {
  constructor(
    public readonly userId: string,
    public readonly batchId: string,
    public readonly remarks?: string,
    public readonly expectedBranchId?: string,
    public readonly expectedCourseId?: string,
  ) {}
}
