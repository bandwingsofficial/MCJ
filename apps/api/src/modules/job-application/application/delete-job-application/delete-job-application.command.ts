export class DeleteJobApplicationCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy?: string,
  ) {}
}
