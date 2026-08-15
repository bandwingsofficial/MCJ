export class UpdateQuizCommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly description?: string | null,
    public readonly passingScore?: number | null,
    public readonly timeLimitMinutes?: number | null,
    public readonly displayOrder?: number,
    public readonly updatedBy?: string | null,
  ) {}
}
