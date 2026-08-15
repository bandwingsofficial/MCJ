export class ActivateCourseLessonCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string | null,
  ) {}
}
