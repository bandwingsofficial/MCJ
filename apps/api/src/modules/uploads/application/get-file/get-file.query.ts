export class GetFileQuery {
  constructor(
    public readonly id?: string,
    public readonly objectKey?: string,
    public readonly url?: string,
    public readonly includeDeleted?: boolean,
  ) {}
}
