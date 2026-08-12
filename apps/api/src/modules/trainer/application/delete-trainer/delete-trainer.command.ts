export class DeleteTrainerCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy?: string,
  ) {}
}
