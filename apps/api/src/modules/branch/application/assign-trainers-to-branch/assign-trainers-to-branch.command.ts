export class AssignTrainersToBranchCommand {
  constructor(
    public readonly branchId: string,
    public readonly trainerIds: string[],
  ) {}
}
