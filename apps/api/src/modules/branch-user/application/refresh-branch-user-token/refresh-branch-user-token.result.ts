export class RefreshBranchUserTokenResult {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly accessTokenExpiresAt: Date,
    public readonly refreshTokenExpiresAt: Date,
  ) {}
}
