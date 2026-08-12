export class RestoreCommunityPostCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
  ) {}
}
