export class AssignCategoriesToBranchResult {
  constructor(
    public readonly branchId: string,
    public readonly assignedCount: number,
    public readonly categoryIds: string[],
  ) {}
}
