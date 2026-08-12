import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../../domain/services/community-post-domain.service';
import { GetCommunityPostResult } from '../get-community-post/get-community-post.result';
import { UpdateCommunityPostCommand } from './update-community-post.command';

const COMMUNITY_UPLOAD_FOLDER = 'community';
const COMMUNITY_MEDIA_FILE_NAME = 'media';

export class UpdateCommunityPostHandler {
  constructor(
    private readonly postRepo: CommunityPostRepository,
    private readonly domainService: CommunityPostDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: UpdateCommunityPostCommand,
  ): Promise<GetCommunityPostResult> {
    const post = this.domainService.ensureExists(
      await this.postRepo.findById(command.id, true),
    );

    this.domainService.ensureNotDeleted(post);

    let nextMediaFileId = post.mediaFileId;
    let nextMediaUrl: string | null = post.mediaUrl.getValue();

    if (
      command.mediaFileId !== undefined &&
      command.mediaFileId !== post.mediaFileId
    ) {
      if (command.mediaFileId) {
        const upload =
          await this.uploadDomainService.replaceLinkedUpload({
            previousUploadId: post.mediaFileId,
            nextUploadId: command.mediaFileId,
            folder: COMMUNITY_UPLOAD_FOLDER,
            entityId: post.id,
            fileName: COMMUNITY_MEDIA_FILE_NAME,
            updatedBy: command.updatedBy,
          });

        nextMediaFileId = upload.id;
        nextMediaUrl = upload.url;
      } else {
        if (post.mediaFileId) {
          await this.uploadDomainService.softDelete(
            post.mediaFileId,
            command.updatedBy,
          );
        }

        nextMediaFileId = null;
        nextMediaUrl = null;
      }
    }

    post.update({
      type: command.type,
      caption: command.caption,
      mediaFileId: nextMediaFileId,
      mediaUrl: nextMediaUrl,
      thumbnailUrl: command.thumbnailUrl,
      hashtags: command.hashtags,
      mentions: command.mentions,
      location: command.location,
      status: command.status,
      updatedBy: command.updatedBy,
    });

    await this.postRepo.save(post);

    return GetCommunityPostResult.fromEntity(post);
  }
}
