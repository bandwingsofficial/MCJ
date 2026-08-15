export class PublishQuizCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string | null,
  ) {}
}
