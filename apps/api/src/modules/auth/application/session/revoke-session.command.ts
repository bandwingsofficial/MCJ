// application/session/revoke-session.command.ts

export class RevokeSessionCommand {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}
