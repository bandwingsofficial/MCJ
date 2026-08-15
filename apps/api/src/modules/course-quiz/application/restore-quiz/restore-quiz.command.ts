export class RestoreQuizCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string | null,
  ) {}
}
