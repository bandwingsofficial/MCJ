export class GetJobQuery {
  constructor(
    public readonly id: string,
    public readonly includeDeleted = false,
    public readonly onlyPublic = false,
  ) {}
}
