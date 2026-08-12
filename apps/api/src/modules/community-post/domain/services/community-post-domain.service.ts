import { Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { CommunityPost } from '../entities/community-post.entity';
import { CommunityPostStatus } from '../enums/community-post-status.enum';
import {
  PostArchivedException,
  PostDeletedException,
  PostInactiveException,
  PostNotDeletedException,
  PostNotFoundException,
} from '../errors/community-post-business.exception';

@Injectable()
export class CommunityPostDomainService {
  ensureExists(post: CommunityPost | null): CommunityPost {
    if (!post) {
      throw new PostNotFoundException();
    }

    return post;
  }

  ensureNotDeleted(post: CommunityPost): void {
    if (post.isDeleted) {
      throw new PostDeletedException();
    }
  }

  ensureDeleted(post: CommunityPost): void {
    if (!post.isDeleted) {
      throw new PostNotDeletedException();
    }
  }

  ensurePubliclyVisible(post: CommunityPost): void {
    this.ensureNotDeleted(post);

    if (!post.isActive) {
      throw new PostInactiveException();
    }

    if (post.status === CommunityPostStatus.ARCHIVED) {
      throw new PostArchivedException();
    }

    if (post.status !== CommunityPostStatus.PUBLISHED) {
      throw new BaseException(
        ERROR_CODES.POST_INACTIVE,
        'Post is not published.',
        400,
      );
    }
  }
}
