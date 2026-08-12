export class GetSignedUrlQuery {
  constructor(
    public readonly id: string,
    public readonly expiresInSeconds?: number,
  ) {}
}
