export class BulkDeleteBranchesResult {
  constructor(
    public readonly success: boolean,

    public readonly deleted: number,

    public readonly message: string,
  ) {}
}