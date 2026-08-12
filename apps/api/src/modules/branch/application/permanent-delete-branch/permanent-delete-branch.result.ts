export class PermanentDeleteBranchResult {
  constructor(
    public readonly branchId: string,
    public readonly permanentlyDeleted: boolean,
  ) {}
}
