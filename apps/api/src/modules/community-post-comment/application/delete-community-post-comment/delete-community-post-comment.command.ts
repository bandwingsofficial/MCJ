export class DeleteCommunityPostCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
  ) {}
}
