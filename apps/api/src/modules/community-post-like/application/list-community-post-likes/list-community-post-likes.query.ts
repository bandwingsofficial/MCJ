export class ListCommunityPostLikesQuery {
  constructor(
    public readonly postId: string,
    public readonly skip?: number,
    public readonly take?: number,
    public readonly skipVisibilityCheck = false,
  ) {}
}
