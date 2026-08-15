export class BulkPermanentDeleteBatchesCommand {
  constructor(public readonly batchIds: string[]) {}
}
