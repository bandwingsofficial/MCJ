// application/session/list-sessions.result.ts

export class SessionDto {
  constructor(
    public readonly id: string,
    public readonly device: string,
    public readonly ipAddress: string | null,
    public readonly isCurrent: boolean,
    public readonly createdAt: Date,
    public readonly lastUsedAt: Date | null,
    public readonly expiresAt: Date,
  ) {}
}

export class ListSessionsResult {
  constructor(public readonly sessions: SessionDto[]) {}
}
