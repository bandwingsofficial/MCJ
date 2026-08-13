export class AssignCategoriesToBranchCommand {
  constructor(
    public readonly branchId: string,
    public readonly categoryIds: string[],
  ) {}
}
