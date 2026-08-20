export class BulkUpdateStudentStatusCommand {
  constructor(
    public readonly studentIds: string[],
    public readonly isActive: boolean,
    public readonly updatedBy?: string,
    public readonly actorBranchId?: string,
  ) {}
}
