export class UnassignCategoryFromBranchCommand {
  constructor(
    public readonly branchId: string,
    public readonly categoryId: string,
  ) {}
}
