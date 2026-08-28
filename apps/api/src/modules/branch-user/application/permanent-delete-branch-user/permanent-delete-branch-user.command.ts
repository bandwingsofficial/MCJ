export class PermanentDeleteBranchUserCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy: string,
  ) {}
}
