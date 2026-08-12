export class UnlikeCommunityPostCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
  ) {}
}
