export class GetCourseLessonQuery {
  constructor(
    public readonly id: string,
    public readonly includeDeleted = false,
    public readonly publicView = true,
  ) {}
}
