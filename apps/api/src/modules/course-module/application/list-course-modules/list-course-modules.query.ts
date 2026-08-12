export class ListCourseModulesQuery {
  constructor(
    public readonly courseId?: string,
    public readonly search?: string,
    public readonly includeDeleted = false,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
