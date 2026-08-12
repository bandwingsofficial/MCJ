import type { CommunityPostLikeRepository } from '../../domain/repositories/community-post-like.repository';
import type { CommunityPostLikeView } from '../../domain/repositories/community-post-like.repository';
import type { CommunityPostRepository } from '@modules/community-post/domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '@modules/community-post/domain/services/community-post-domain.service';
import { ListCommunityPostLikesQuery } from './list-community-post-likes.query';

export class ListCommunityPostLikesHandler {
  constructor(
    private readonly likeRepo: CommunityPostLikeRepository,
    private readonly postRepo: CommunityPostRepository,
    private readonly postDomainService: CommunityPostDomainService,
  ) {}

  async execute(
    query: ListCommunityPostLikesQuery,
  ): Promise<CommunityPostLikeView[]> {
    const post = this.postDomainService.ensureExists(
      await this.postRepo.findById(query.postId),
    );

    this.postDomainService.ensurePubliclyVisible(post);

    return this.likeRepo.findViewsByPostId(query.postId);
  }
}
