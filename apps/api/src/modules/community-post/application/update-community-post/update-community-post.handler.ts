import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { CommunityPostType } from '../../domain/enums/community-post-type.enum';
import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../../domain/services/community-post-domain.service';
import { GetCommunityPostResult } from '../get-community-post/get-community-post.result';
import {
  collectCommunityPostMediaFileIds,
  resolveCommunityPostMediaCollection,
} from '../shared/community-post-media-sync';
import { UpdateCommunityPostCommand } from './update-community-post.command';

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

    const oldFileIds = collectCommunityPostMediaFileIds(post.mediaItems);

    let nextType = post.type;
    let nextMediaFileId = post.mediaFileId;
    let nextMediaUrl = post.mediaUrl.getValue();
    let nextThumbnailUrl = post.thumbnailUrl.getValue();
    let nextPrimaryMediaFileId = post.primaryMediaFileId;
    let nextMediaItems = post.mediaItems;

    if (command.media !== undefined) {
      const resolvedMedia = await resolveCommunityPostMediaCollection({
        postId: post.id,
        mediaInputs: command.media,
        existingMedia: post.mediaItems,
        uploadDomainService: this.uploadDomainService,
        updatedBy: command.updatedBy,
      });

      nextType = resolvedMedia.type;
      nextMediaFileId = resolvedMedia.mediaFileId;
      nextMediaUrl = resolvedMedia.mediaUrl;
      nextThumbnailUrl = resolvedMedia.thumbnailUrl;
      nextPrimaryMediaFileId = resolvedMedia.primaryMediaFileId;
      nextMediaItems = resolvedMedia.mediaItems;
    } else if (
      command.mediaFileId !== undefined &&
      command.mediaFileId !== post.mediaFileId
    ) {
      const resolvedMedia = command.mediaFileId
        ? await resolveCommunityPostMediaCollection({
            postId: post.id,
            mediaInputs: [
              {
                fileId: command.mediaFileId,
                mediaType: command.type ?? post.type,
                displayOrder: 0,
                isPrimary:
                  (command.type ?? post.type) === CommunityPostType.IMAGE ||
                  post.type === CommunityPostType.IMAGE,
              },
            ],
            existingMedia: post.mediaItems,
            uploadDomainService: this.uploadDomainService,
            updatedBy: command.updatedBy,
          })
        : {
            mediaItems: [],
            type: post.type,
            primaryMediaFileId: null,
            mediaFileId: null,
            mediaUrl: null,
            thumbnailUrl: null,
          };

      nextType = resolvedMedia.type;
      nextMediaFileId = resolvedMedia.mediaFileId;
      nextMediaUrl = resolvedMedia.mediaUrl;
      nextThumbnailUrl = resolvedMedia.thumbnailUrl;
      nextPrimaryMediaFileId = resolvedMedia.primaryMediaFileId;
      nextMediaItems = resolvedMedia.mediaItems;
    }

    post.update({
      type: command.type ?? nextType,
      caption: command.caption,
      mediaFileId: nextMediaFileId,
      mediaUrl: nextMediaUrl,
      thumbnailUrl: command.thumbnailUrl ?? nextThumbnailUrl,
      primaryMediaFileId: nextPrimaryMediaFileId,
      mediaItems: nextMediaItems,
      hashtags: command.hashtags,
      mentions: command.mentions,
      location: command.location,
      status: command.status,
      updatedBy: command.updatedBy,
    });

    await this.postRepo.save(post);

    await this.uploadDomainService.softDeleteReplacedUploads(
      oldFileIds,
      collectCommunityPostMediaFileIds(post.mediaItems),
      command.updatedBy,
    );

    return GetCommunityPostResult.fromEntity(post);
  }
}
