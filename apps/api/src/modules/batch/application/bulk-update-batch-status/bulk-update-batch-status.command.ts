export class BulkUpdateBatchStatusCommand {
  constructor(
    public readonly batchIds: string[],
    public readonly isActive: boolean,
    public readonly updatedBy?: string,
  ) {}
}
