export class GetMeQuery {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string | null = null,
  ) {}
}
