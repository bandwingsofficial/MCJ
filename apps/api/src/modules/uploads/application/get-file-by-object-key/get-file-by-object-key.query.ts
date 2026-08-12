export class GetFileByObjectKeyQuery {
  constructor(
    public readonly objectKey: string,
    public readonly includeDeleted?: boolean,
  ) {}
}
