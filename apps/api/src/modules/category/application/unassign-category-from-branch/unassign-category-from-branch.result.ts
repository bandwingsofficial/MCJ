export class UnassignCategoryFromBranchResult {
  constructor(
    public readonly branchId: string,
    public readonly categoryId: string,
    public readonly unassigned: boolean,
  ) {}
}
