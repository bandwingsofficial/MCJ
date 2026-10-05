import { PostShareRequiresViewException } from '../../domain/errors/community-post-business.exception';
import type { CommunityPostEngagementRepository } from '../../domain/repositories/community-post-engagement.repository';
import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../../domain/services/community-post-domain.service';
import {
  IncrementCommunityPostShareCommand,
  IncrementCommunityPostShareResult,
} from './increment-community-post-share.command';

export class IncrementCommunityPostShareHandler {
  constructor(
    private readonly postRepo: CommunityPostRepository,
    private readonly engagementRepo: CommunityPostEngagementRepository,
    private readonly domainService: CommunityPostDomainService,
  ) {}

  async execute(
    command: IncrementCommunityPostShareCommand,
  ): Promise<IncrementCommunityPostShareResult> {
    const post = this.domainService.ensureExists(
      await this.postRepo.findById(command.id),
    );

    this.domainService.ensurePubliclyVisible(post);

    const hasViewed = await this.engagementRepo.userHasViewedPost(
      command.id,
      command.userId,
    );

    if (!hasViewed) {
      throw new PostShareRequiresViewException();
    }

    const shareCount = await this.engagementRepo.recordShare(
      command.id,
      command.userId,
    );

    return new IncrementCommunityPostShareResult(command.id, shareCount);
  }
}
