export class RestoreCourseLessonCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
  ) {}
}
