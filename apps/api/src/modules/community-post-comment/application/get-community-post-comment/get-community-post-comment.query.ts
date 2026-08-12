export class GetCommunityPostCommentQuery {
  constructor(
    public readonly commentId: string,
    public readonly includeBlocked = false,
    public readonly includeDeleted = false,
  ) {}
}
