export class ReorderBranchesCommand {
  constructor(
    public readonly branchId: string,
    public readonly newDisplayOrder: number,
  ) {}
}
