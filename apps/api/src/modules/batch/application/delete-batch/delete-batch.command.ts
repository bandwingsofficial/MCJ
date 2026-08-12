export class DeleteBatchCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy?: string,
  ) {}
}
