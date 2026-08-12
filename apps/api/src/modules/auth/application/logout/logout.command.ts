// application/logout/logout.command.ts

export class LogoutCommand {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}
