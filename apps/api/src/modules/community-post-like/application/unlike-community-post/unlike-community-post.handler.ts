import { PostNotLikedException } from '../../domain/errors/community-post-like-business.exception';
import type { CommunityPostLikeRepository } from '../../domain/repositories/community-post-like.repository';
import type { CommunityPostRepository } from '@modules/community-post/domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '@modules/community-post/domain/services/community-post-domain.service';
import { UnlikeCommunityPostCommand } from './unlike-community-post.command';

export class UnlikeCommunityPostHandler {
  constructor(
    private readonly likeRepo: CommunityPostLikeRepository,
    private readonly postRepo: CommunityPostRepository,
    private readonly postDomainService: CommunityPostDomainService,
  ) {}

  async execute(command: UnlikeCommunityPostCommand): Promise<void> {
    const post = this.postDomainService.ensureExists(
      await this.postRepo.findById(command.postId),
    );

    this.postDomainService.ensurePubliclyVisible(post);

    const removed = await this.likeRepo.deleteByPostAndUser(
      command.postId,
      command.userId,
    );

    if (!removed) {
      throw new PostNotLikedException();
    }

    await this.postRepo.decrementLikeCount(command.postId);
  }
}
