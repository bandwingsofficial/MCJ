import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../../domain/services/community-post-domain.service';
import { GetCommunityPostResult } from '../get-community-post/get-community-post.result';
import { UpdateCommunityPostActivationCommand } from './update-community-post-activation.command';

export class UpdateCommunityPostActivationHandler {
  constructor(
    private readonly postRepo: CommunityPostRepository,
    private readonly domainService: CommunityPostDomainService,
  ) {}

  async execute(
    command: UpdateCommunityPostActivationCommand,
  ): Promise<GetCommunityPostResult> {
    const post = this.domainService.ensureExists(
      await this.postRepo.findById(command.id),
    );

    this.domainService.ensureNotDeleted(post);

    if (command.activate) {
      post.activate(command.updatedBy);
    } else {
      post.deactivate(command.updatedBy);
    }

    await this.postRepo.save(post);

    return GetCommunityPostResult.fromEntity(post);
  }
}
