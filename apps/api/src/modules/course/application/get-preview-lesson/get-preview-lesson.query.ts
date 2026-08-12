export class GetPreviewLessonQuery {
  constructor(
    public readonly courseId: string,
    public readonly lessonId: string,
    public readonly onlyActive = true,
  ) {}
}
