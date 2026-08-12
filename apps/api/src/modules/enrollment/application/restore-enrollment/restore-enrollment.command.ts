export class RestoreEnrollmentCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
    public readonly actorBranchId?: string,
  ) {}
}
