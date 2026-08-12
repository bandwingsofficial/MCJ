import { randomUUID } from 'crypto';

import type { CommunityPostRepository } from '@modules/community-post/domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '@modules/community-post/domain/services/community-post-domain.service';
import { CommunityPostLike } from '../../domain/entities/community-post-like.entity';
import type { CommunityPostLikeRepository } from '../../domain/repositories/community-post-like.repository';
import { CommunityPostLikeDomainService } from '../../domain/services/community-post-like-domain.service';
import { LikeCommunityPostCommand } from './like-community-post.command';

export class LikeCommunityPostHandler {
  constructor(
    private readonly likeRepo: CommunityPostLikeRepository,
    private readonly postRepo: CommunityPostRepository,
    private readonly postDomainService: CommunityPostDomainService,
    private readonly likeDomainService: CommunityPostLikeDomainService,
  ) {}

  async execute(command: LikeCommunityPostCommand): Promise<void> {
    const post = this.postDomainService.ensureExists(
      await this.postRepo.findById(command.postId),
    );

    this.postDomainService.ensurePubliclyVisible(post);

    await this.likeDomainService.ensureNotAlreadyLiked(
      this.likeRepo,
      command.postId,
      command.userId,
    );

    const like = CommunityPostLike.create({
      id: randomUUID(),
      postId: command.postId,
      userId: command.userId,
    });

    await this.likeRepo.save(like);
    await this.postRepo.incrementLikeCount(command.postId);
  }
}
