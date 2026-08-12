export class RestoreJobCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
  ) {}
}
