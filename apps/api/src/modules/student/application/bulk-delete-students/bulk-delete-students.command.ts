export class BulkDeleteStudentsCommand {
  constructor(
    public readonly studentIds: string[],
    public readonly deletedBy?: string,
    public readonly actorBranchId?: string,
  ) {}
}
