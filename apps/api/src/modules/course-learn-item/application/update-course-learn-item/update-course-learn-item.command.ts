export class UpdateCourseLearnItemCommand {
  constructor(
    public readonly id: string,
    public readonly title: string | undefined,
    public readonly explanation: string | undefined,
    public readonly imageUrl: string | null | undefined,
    public readonly keyLearningPoints: string[] | null | undefined,
    public readonly finalThoughts: string | null | undefined,
    public readonly summary: string | null | undefined,
    public readonly updatedBy?: string | null,
  ) {}
}
