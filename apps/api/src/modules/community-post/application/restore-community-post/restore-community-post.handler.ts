import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../../domain/services/community-post-domain.service';
import { GetCommunityPostResult } from '../get-community-post/get-community-post.result';
import { RestoreCommunityPostCommand } from './restore-community-post.command';

export class RestoreCommunityPostHandler {
  constructor(
    private readonly postRepo: CommunityPostRepository,
    private readonly domainService: CommunityPostDomainService,
  ) {}

  async execute(
    command: RestoreCommunityPostCommand,
  ): Promise<GetCommunityPostResult> {
    const post = this.domainService.ensureExists(
      await this.postRepo.findById(command.id, true),
    );

    this.domainService.ensureDeleted(post);

    await this.postRepo.restoreCascade(command.id, command.updatedBy);

    const restored = this.domainService.ensureExists(
      await this.postRepo.findById(command.id, true),
    );

    return GetCommunityPostResult.fromEntity(restored);
  }
}
