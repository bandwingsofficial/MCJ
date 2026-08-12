export class UpdateCommunityPostCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly content: string,
  ) {}
}
