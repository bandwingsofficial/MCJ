export class DeleteEnrollmentCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy?: string,
    public readonly actorBranchId?: string,
  ) {}
}
