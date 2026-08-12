export class GetFileByUrlQuery {
  constructor(
    public readonly url: string,
    public readonly includeDeleted?: boolean,
  ) {}
}
