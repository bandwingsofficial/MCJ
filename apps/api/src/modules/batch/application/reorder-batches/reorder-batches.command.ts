export class ReorderBatchesCommand {
  constructor(
    public readonly batchId: string,
    public readonly newDisplayOrder: number,
  ) {}
}
