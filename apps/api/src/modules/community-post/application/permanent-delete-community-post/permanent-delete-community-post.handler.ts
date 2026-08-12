import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../../domain/services/community-post-domain.service';
import {
  PermanentDeleteCommunityPostCommand,
  PermanentDeleteCommunityPostResult,
} from './permanent-delete-community-post.command';

export class PermanentDeleteCommunityPostHandler {
  constructor(
    private readonly postRepo: CommunityPostRepository,
    private readonly domainService: CommunityPostDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: PermanentDeleteCommunityPostCommand,
  ): Promise<PermanentDeleteCommunityPostResult> {
    const post = this.domainService.ensureExists(
      await this.postRepo.findById(command.id, true),
    );

    this.domainService.ensureDeleted(post);

    const mediaFileId = post.mediaFileId;

    await this.postRepo.permanentDeleteCascade(command.id);

    if (mediaFileId) {
      await this.uploadDomainService.permanentDelete(mediaFileId);
    }

    return new PermanentDeleteCommunityPostResult(command.id, true);
  }
}
