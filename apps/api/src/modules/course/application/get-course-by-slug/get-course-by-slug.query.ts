export class GetCourseBySlugQuery {
  constructor(
    public readonly slug: string,
    public readonly includeDeleted?: boolean,
    public readonly onlyActive?: boolean,
    public readonly userId?: string,
    public readonly includeProtectedContent = false,
  ) {}
}