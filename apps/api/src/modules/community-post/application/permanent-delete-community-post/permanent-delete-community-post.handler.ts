import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../../domain/services/community-post-domain.service';
import {
  collectCommunityPostMediaFileIds,
} from '../shared/community-post-media-sync';
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

    const mediaFileIds = collectCommunityPostMediaFileIds(post.mediaItems);
    if (post.mediaFileId && !mediaFileIds.includes(post.mediaFileId)) {
      mediaFileIds.push(post.mediaFileId);
    }
    if (
      post.primaryMediaFileId &&
      !mediaFileIds.includes(post.primaryMediaFileId)
    ) {
      mediaFileIds.push(post.primaryMediaFileId);
    }

    await this.postRepo.permanentDeleteCascade(command.id);

    await Promise.all(
      mediaFileIds.map((fileId) =>
        this.uploadDomainService.permanentDelete(fileId),
      ),
    );

    return new PermanentDeleteCommunityPostResult(command.id, true);
  }
}
