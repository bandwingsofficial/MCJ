export class BulkDeleteBranchesCommand {
  constructor(
    public readonly branchIds: string[],
  ) {}
}