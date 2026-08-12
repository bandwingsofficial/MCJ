import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../../domain/services/community-post-domain.service';
import {
  DeleteCommunityPostCommand,
  DeleteCommunityPostResult,
} from './delete-community-post.command';

export class DeleteCommunityPostHandler {
  constructor(
    private readonly postRepo: CommunityPostRepository,
    private readonly domainService: CommunityPostDomainService,
  ) {}

  async execute(
    command: DeleteCommunityPostCommand,
  ): Promise<DeleteCommunityPostResult> {
    const post = this.domainService.ensureExists(
      await this.postRepo.findById(command.id),
    );

    this.domainService.ensureNotDeleted(post);

    await this.postRepo.softDeleteCascade(command.id, command.deletedBy);

    const deleted = await this.postRepo.findById(command.id, true);

    return new DeleteCommunityPostResult(
      command.id,
      true,
      deleted?.deletedAt ?? new Date(),
    );
  }
}
