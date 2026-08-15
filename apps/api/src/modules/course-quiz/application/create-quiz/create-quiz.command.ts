export class CreateQuizCommand {
  constructor(
    public readonly lessonId: string,
    public readonly title: string,
    public readonly description?: string | null,
    public readonly passingScore?: number | null,
    public readonly timeLimitMinutes?: number | null,
    public readonly createdBy?: string | null,
  ) {}
}
