export class GetCommunityPostQuery {
  constructor(
    public readonly id: string,
    public readonly includeDeleted = false,
    public readonly onlyPublished = false,
    public readonly includeComments = false,
    public readonly includeBlockedComments = false,
  ) {}
}
