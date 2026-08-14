export class BulkRestoreBranchesResult {
  constructor(
    public readonly success: boolean,
    public readonly restored: number,
    public readonly message: string,
  ) {}
}