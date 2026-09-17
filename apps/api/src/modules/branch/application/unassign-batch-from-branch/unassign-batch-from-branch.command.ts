export class UnassignBatchFromBranchCommand {
  constructor(
    public readonly branchId: string,
    public readonly batchId: string,
  ) {}
}
