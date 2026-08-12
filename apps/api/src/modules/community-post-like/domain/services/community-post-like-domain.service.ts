import { Injectable } from '@nestjs/common';

import { PostAlreadyLikedException } from '../errors/community-post-like-business.exception';
import type { CommunityPostLikeRepository } from '../repositories/community-post-like.repository';

@Injectable()
export class CommunityPostLikeDomainService {
  async ensureNotAlreadyLiked(
    repo: CommunityPostLikeRepository,
    postId: string,
    userId: string,
  ): Promise<void> {
    if (await repo.existsActiveByPostAndUser(postId, userId)) {
      throw new PostAlreadyLikedException();
    }
  }
}
