// src/modules/branch-user/application/restore-branch-user/restore-branch-user.command.ts

export class RestoreBranchUserCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
  ) {}
}