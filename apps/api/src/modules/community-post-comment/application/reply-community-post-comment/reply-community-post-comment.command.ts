export class ReplyCommunityPostCommentCommand {
  constructor(
    public readonly postId: string,
    public readonly parentCommentId: string,
    public readonly userId: string,
    public readonly content: string,
  ) {}
}
