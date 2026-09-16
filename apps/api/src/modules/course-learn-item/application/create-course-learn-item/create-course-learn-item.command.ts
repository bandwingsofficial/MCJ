export class CreateCourseLearnItemCommand {
  constructor(
    public readonly lessonId: string,
    public readonly title: string,
    public readonly explanation: string,
    public readonly imageUrl: string | null | undefined,
    public readonly keyLearningPoints: string[] | null | undefined,
    public readonly finalThoughts: string | null | undefined,
    public readonly summary: string | null | undefined,
    public readonly createdBy?: string | null,
  ) {}
}
