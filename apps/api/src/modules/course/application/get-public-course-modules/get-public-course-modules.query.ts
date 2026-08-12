export class GetPublicCourseModulesQuery {
  constructor(
    public readonly courseId: string,
    public readonly onlyActive = true,
  ) {}
}
