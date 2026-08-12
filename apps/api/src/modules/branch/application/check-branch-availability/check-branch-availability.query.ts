export class CheckBranchAvailabilityQuery {
  constructor(
    public readonly branchCode?: string,
    public readonly branchName?: string,
    public readonly excludeId?: string,
  ) {}
}
