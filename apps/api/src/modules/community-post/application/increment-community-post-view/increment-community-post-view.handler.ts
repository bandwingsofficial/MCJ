import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../../domain/services/community-post-domain.service';
import {
  IncrementCommunityPostViewCommand,
  IncrementCommunityPostViewResult,
} from './increment-community-post-view.command';

export class IncrementCommunityPostViewHandler {
  constructor(
    private readonly postRepo: CommunityPostRepository,
    private readonly domainService: CommunityPostDomainService,
  ) {}

  async execute(
    command: IncrementCommunityPostViewCommand,
  ): Promise<IncrementCommunityPostViewResult> {
    const post = this.domainService.ensureExists(
      await this.postRepo.findById(command.id),
    );

    this.domainService.ensurePubliclyVisible(post);

    await this.postRepo.incrementViewCount(command.id);

    const updated = this.domainService.ensureExists(
      await this.postRepo.findById(command.id),
    );

    return new IncrementCommunityPostViewResult(
      updated.id,
      updated.viewCount,
    );
  }
}
