// application/password-reset/request-password-reset.command.ts

export class RequestPasswordResetCommand {
  constructor(
    public readonly email: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}