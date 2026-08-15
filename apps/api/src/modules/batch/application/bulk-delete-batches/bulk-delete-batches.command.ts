export class BulkDeleteBatchesCommand {
  constructor(
    public readonly batchIds: string[],
    public readonly deletedBy?: string,
  ) {}
}
