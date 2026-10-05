import type { CommunityPostEngagementRepository } from '../../domain/repositories/community-post-engagement.repository';
import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../../domain/services/community-post-domain.service';
import {
  IncrementCommunityPostViewCommand,
  IncrementCommunityPostViewResult,
} from './increment-community-post-view.command';

export class IncrementCommunityPostViewHandler {
  constructor(
    private readonly postRepo: CommunityPostRepository,
    private readonly engagementRepo: CommunityPostEngagementRepository,
    private readonly domainService: CommunityPostDomainService,
  ) {}

  async execute(
    command: IncrementCommunityPostViewCommand,
  ): Promise<IncrementCommunityPostViewResult> {
    const post = this.domainService.ensureExists(
      await this.postRepo.findById(command.id),
    );

    this.domainService.ensurePubliclyVisible(post);

    const viewCount = await this.engagementRepo.recordView(
      command.id,
      command.userId,
    );

    return new IncrementCommunityPostViewResult(command.id, viewCount);
  }
}
