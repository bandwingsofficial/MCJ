export class GetCourseQuery {
  constructor(
    public readonly id: string,
    public readonly includeDeleted = false,
    public readonly onlyActive = false,
    public readonly userId?: string,
    public readonly includeProtectedContent = false,
  ) {}
}
