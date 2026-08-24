export class ListCourseLessonsQuery {
  constructor(
    public readonly moduleId?: string,
    public readonly parentLessonId?: string | null,
    public readonly contentType?: string,
    public readonly search?: string,
    public readonly includeDeleted = false,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
