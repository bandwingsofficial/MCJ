export class ListCommunityPostCommentsQuery {
  constructor(
    public readonly postId: string,
    public readonly onlyPublished = true,
    public readonly includeBlocked = false,
  ) {}
}
