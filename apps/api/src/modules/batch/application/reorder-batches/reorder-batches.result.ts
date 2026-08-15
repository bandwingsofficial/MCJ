export class ReorderBatchesResult {
  constructor(
    public readonly batchId: string,
    public readonly displayOrder: number,
  ) {}
}
