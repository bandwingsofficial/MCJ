export class RejectEnrollmentCommand {
  constructor(
    public readonly id: string,
    public readonly reason: string,
    public readonly updatedBy: string,
    public readonly actorBranchId?: string | null,
  ) {}
}
