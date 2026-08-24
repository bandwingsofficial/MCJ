export class ApproveEnrollmentCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy: string,
    public readonly actorBranchId?: string | null,
  ) {}
}
