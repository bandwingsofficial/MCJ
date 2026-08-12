export class CheckBranchAvailabilityResult {
  constructor(
    public readonly branchCodeAvailable: boolean | null,
    public readonly branchNameAvailable: boolean | null,
    public readonly branchCodeMessage: string | null,
    public readonly branchNameMessage: string | null,
  ) {}
}
