export class BulkRestoreStudentsCommand {
  constructor(
    public readonly studentIds: string[],
    public readonly updatedBy?: string,
    public readonly actorBranchId?: string,
  ) {}
}
