export class BulkRestoreBatchesCommand {
  constructor(
    public readonly batchIds: string[],
    public readonly updatedBy?: string,
  ) {}
}
