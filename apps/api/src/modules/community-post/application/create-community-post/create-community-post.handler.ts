import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { CommunityPost } from '../../domain/entities/community-post.entity';
import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { GetCommunityPostResult } from '../get-community-post/get-community-post.result';
import { CreateCommunityPostCommand } from './create-community-post.command';

const COMMUNITY_UPLOAD_FOLDER = 'community';
const COMMUNITY_MEDIA_FILE_NAME = 'media';

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
    let mediaFileId: string | null = null;
    let mediaUrl: string | null = null;

    if (command.mediaFileId) {
      const upload = await this.uploadDomainService.attachToEntity({
        uploadId: command.mediaFileId,
        folder: COMMUNITY_UPLOAD_FOLDER,
        entityId: postId,
        fileName: COMMUNITY_MEDIA_FILE_NAME,
      });

      mediaFileId = upload.id;
      mediaUrl = upload.url;
    }

    const post = CommunityPost.create({
      id: postId,
      type: command.type,
      caption: command.caption,
      mediaFileId,
      mediaUrl,
      thumbnailUrl: command.thumbnailUrl,
      hashtags: command.hashtags,
      mentions: command.mentions,
      location: command.location,
      status: command.status,
      createdBy: command.createdBy,
    });

    await this.postRepo.save(post);
    this.logger.log(`✅ Community post created: ${post.id}`);

    return GetCommunityPostResult.fromEntity(post);
  }
}
