export class RestoreJobApplicationCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
  ) {}
}
