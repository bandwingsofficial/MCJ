export class ListCourseQuizzesQuery {
  constructor(
    public readonly lessonId?: string,
    public readonly includeDeleted?: boolean,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
