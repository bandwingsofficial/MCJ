// application/password-reset/reset-password.command.ts

export class ResetPasswordCommand {
  constructor(
    public readonly token: string,
    public readonly newPassword: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}
