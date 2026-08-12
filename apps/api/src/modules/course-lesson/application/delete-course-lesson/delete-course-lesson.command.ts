export class DeleteCourseLessonCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy?: string,
  ) {}
}
