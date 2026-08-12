// application/commands/login-user.command.ts

export class LoginUserCommand {
  constructor(
    public readonly identifier: string, // 🔥 email OR phone
    public readonly password: string,

    // 🔐 session tracking
    public readonly userAgent?: string,
    public readonly ipAddress?: string,
  ) {}
}
