export class AssignBatchesToBranchResult {
  constructor(
    public readonly branchId: string,
    public readonly assignedCount: number,
    public readonly batchIds: string[],
  ) {}
}
