import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../../domain/services/community-post-domain.service';
import {
  IncrementCommunityPostShareCommand,
  IncrementCommunityPostShareResult,
} from './increment-community-post-share.command';

export class IncrementCommunityPostShareHandler {
  constructor(
    private readonly postRepo: CommunityPostRepository,
    private readonly domainService: CommunityPostDomainService,
  ) {}

  async execute(
    command: IncrementCommunityPostShareCommand,
  ): Promise<IncrementCommunityPostShareResult> {
    const post = this.domainService.ensureExists(
      await this.postRepo.findById(command.id),
    );

    this.domainService.ensurePubliclyVisible(post);

    await this.postRepo.incrementShareCount(command.id);

    const updated = this.domainService.ensureExists(
      await this.postRepo.findById(command.id),
    );

    return new IncrementCommunityPostShareResult(
      updated.id,
      updated.shareCount,
    );
  }
}
