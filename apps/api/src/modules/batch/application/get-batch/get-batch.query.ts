export class GetBatchQuery {
  constructor(
    public readonly id: string,
    public readonly includeDeleted = false,
    public readonly onlyActive = false,
  ) {}
}
