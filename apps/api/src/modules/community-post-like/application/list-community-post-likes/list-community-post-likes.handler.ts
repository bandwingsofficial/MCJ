import type { CommunityPostLikeRepository } from '../../domain/repositories/community-post-like.repository';
import type { CommunityPostRepository } from '@modules/community-post/domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '@modules/community-post/domain/services/community-post-domain.service';
import { ListCommunityPostLikesQuery } from './list-community-post-likes.query';
import { ListCommunityPostLikesResult } from './list-community-post-likes.result';

export class ListCommunityPostLikesHandler {
  constructor(
    private readonly likeRepo: CommunityPostLikeRepository,
    private readonly postRepo: CommunityPostRepository,
    private readonly postDomainService: CommunityPostDomainService,
  ) {}

  async execute(
    query: ListCommunityPostLikesQuery,
  ): Promise<ListCommunityPostLikesResult> {
    const post = this.postDomainService.ensureExists(
      await this.postRepo.findById(query.postId, query.skipVisibilityCheck),
    );

    if (!query.skipVisibilityCheck) {
      this.postDomainService.ensurePubliclyVisible(post);
    }

    const [items, total] = await Promise.all([
      this.likeRepo.findViewsByPostId(query.postId, {
        skip: query.skip,
        take: query.take,
      }),
      this.likeRepo.countByPostId(query.postId),
    ]);

    return new ListCommunityPostLikesResult(items, total);
  }
}
