export class CancelBatchCommand {
  constructor(
    public readonly batchId: string,
    public readonly reason: string,
    public readonly updatedBy?: string,
  ) {}
}
