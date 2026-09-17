export class AssignBatchesToBranchCommand {
  constructor(
    public readonly branchId: string,
    public readonly batchIds: string[],
  ) {}
}
