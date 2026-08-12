export class GetCourseModuleQuery {
  constructor(
    public readonly id: string,
    public readonly includeDeleted = false,
  ) {}
}
