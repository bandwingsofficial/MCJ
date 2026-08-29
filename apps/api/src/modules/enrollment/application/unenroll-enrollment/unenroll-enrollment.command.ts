export class UnenrollEnrollmentCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy: string,
    public readonly actorBranchId?: string | null,
    public readonly reason?: string | null,
  ) {}
}
