export class DeleteJobCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy?: string,
  ) {}
}
