// application/session/logout-all.command.ts

export class LogoutAllCommand {
  constructor(
    public readonly userId: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}