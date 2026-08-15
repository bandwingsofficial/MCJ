export class DeactivateCourseLessonCommand {
  constructor(
    public readonly id: string,
    public readonly deactivatedBy?: string | null,
  ) {}
}
