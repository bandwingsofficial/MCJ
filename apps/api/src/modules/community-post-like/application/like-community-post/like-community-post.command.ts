export class LikeCommunityPostCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
  ) {}
}
