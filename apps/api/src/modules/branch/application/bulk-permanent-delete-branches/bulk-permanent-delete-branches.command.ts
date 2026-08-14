export class BulkPermanentDeleteBranchesCommand {
  constructor(
    public readonly branchIds: string[],
  ) {}
}