export class ListCourseLearnItemsQuery {
  constructor(
    public readonly lessonId?: string,
    public readonly search?: string,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
