export class GetSignedUrlResult {
  constructor(
    public readonly id: string,
    public readonly objectKey: string,
    public readonly signedUrl: string,
    public readonly expiresInSeconds: number,
  ) {}
}
