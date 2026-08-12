export class RestoreStudentCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
    public readonly actorBranchId?: string,
  ) {}
}
