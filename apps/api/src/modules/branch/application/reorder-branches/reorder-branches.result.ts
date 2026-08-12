export class ReorderBranchesResult {
  constructor(
    public readonly branchId: string,
    public readonly displayOrder: number,
  ) {}
}
