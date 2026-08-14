export class BulkRestoreBranchesCommand {
  constructor(
    public readonly branchIds: string[],
  ) {}
}
