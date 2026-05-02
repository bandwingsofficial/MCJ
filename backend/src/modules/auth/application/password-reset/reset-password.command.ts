// application/password-reset/reset-password.command.ts

export class ResetPasswordCommand {
  constructor(
    public readonly email: string,
    public readonly otp: string,
    public readonly newPassword: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}