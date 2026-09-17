export class UnassignBatchFromBranchResult {
  constructor(
    public readonly branchId: string,
    public readonly batchId: string,
    public readonly unassigned: boolean,
  ) {}
}
