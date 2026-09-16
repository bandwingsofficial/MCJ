import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { CommunityPost } from '../../domain/entities/community-post.entity';
import { CommunityPostType } from '../../domain/enums/community-post-type.enum';
import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { GetCommunityPostResult } from '../get-community-post/get-community-post.result';
import {
  resolveCommunityPostMediaCollection,
} from '../shared/community-post-media-sync';
import { CreateCommunityPostCommand } from './create-community-post.command';

export class CreateCommunityPostHandler {
  private readonly logger = new Logger(CreateCommunityPostHandler.name);

  constructor(
    private readonly postRepo: CommunityPostRepository,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: CreateCommunityPostCommand,
  ): Promise<GetCommunityPostResult> {
    const postId = randomUUID();
    const mediaInputs = command.media ?? [];

    if (!mediaInputs.length && command.mediaFileId) {
      mediaInputs.push({
        fileId: command.mediaFileId,
        mediaType: command.type ?? CommunityPostType.IMAGE,
        displayOrder: 0,
        isPrimary: (command.type ?? CommunityPostType.IMAGE) === CommunityPostType.IMAGE,
      });
    }

    const resolvedMedia = mediaInputs.length
      ? await resolveCommunityPostMediaCollection({
          postId,
          mediaInputs,
          uploadDomainService: this.uploadDomainService,
          updatedBy: command.createdBy,
        })
      : null;

    const post = CommunityPost.create({
      id: postId,
      type: resolvedMedia?.type ?? command.type ?? CommunityPostType.IMAGE,
      caption: command.caption,
      mediaFileId: resolvedMedia?.mediaFileId ?? null,
      mediaUrl: resolvedMedia?.mediaUrl ?? null,
      thumbnailUrl: resolvedMedia?.thumbnailUrl ?? command.thumbnailUrl,
      primaryMediaFileId: resolvedMedia?.primaryMediaFileId ?? null,
      mediaItems: resolvedMedia?.mediaItems ?? [],
      hashtags: command.hashtags,
      mentions: command.mentions,
      authorName: command.authorName,
      location: command.location,
      status: command.status,
      createdBy: command.createdBy,
    });

    await this.postRepo.save(post);
    this.logger.log(`✅ Community post created: ${post.id}`);

    return GetCommunityPostResult.fromEntity(post);
  }
}
