import type { CommunityPostLikeView } from '../../domain/repositories/community-post-like.repository';

export class ListCommunityPostLikesResult {
  constructor(
    public readonly items: CommunityPostLikeView[],
    public readonly total: number,
  ) {}
}
