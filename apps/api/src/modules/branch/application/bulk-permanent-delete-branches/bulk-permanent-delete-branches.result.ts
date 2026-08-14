export class BulkPermanentDeleteBranchesResult {
  constructor(
    public readonly success: boolean,
    public readonly permanentlyDeleted: number,
    public readonly message: string,
  ) {}
}