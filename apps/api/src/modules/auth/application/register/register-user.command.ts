// application/commands/register-user.command.ts
export class RegisterUserCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly phone?: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}
