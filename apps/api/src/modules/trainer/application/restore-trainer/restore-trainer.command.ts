export class RestoreTrainerCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
  ) {}
}
