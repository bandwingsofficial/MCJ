export class LoginBranchUserCommand {
  constructor(
    public readonly identifier: string,
    public readonly password: string,
  ) {}
}
