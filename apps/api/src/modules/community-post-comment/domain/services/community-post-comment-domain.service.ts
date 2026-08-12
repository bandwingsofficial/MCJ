import { Injectable } from '@nestjs/common';

import { CommunityPostComment } from '../entities/community-post-comment.entity';
import {
  CommentAccessDeniedException,
  CommentBlockedException,
  CommentDeletedException,
  CommentNotDeletedException,
  CommentNotFoundException,
} from '../errors/community-post-comment-business.exception';
import type {
  CommunityPostCommentRepository,
  CommunityPostCommentView,
} from '../repositories/community-post-comment.repository';

@Injectable()
export class CommunityPostCommentDomainService {
  ensureExists(
    comment: CommunityPostComment | null,
  ): CommunityPostComment {
    if (!comment) {
      throw new CommentNotFoundException();
    }

    return comment;
  }

  ensureViewExists(
    comment: CommunityPostCommentView | null,
  ): CommunityPostCommentView {
    if (!comment) {
      throw new CommentNotFoundException();
    }

    return comment;
  }

  ensureNotDeleted(comment: CommunityPostComment): void {
    if (comment.isDeleted) {
      throw new CommentDeletedException();
    }
  }

  ensureDeleted(comment: CommunityPostComment): void {
    if (!comment.isDeleted) {
      throw new CommentNotDeletedException();
    }
  }

  ensureOwner(comment: CommunityPostComment, userId: string): void {
    if (comment.userId !== userId) {
      throw new CommentAccessDeniedException();
    }
  }

  ensurePubliclyVisible(comment: CommunityPostComment): void {
    this.ensureNotDeleted(comment);

    if (comment.isBlocked) {
      throw new CommentBlockedException();
    }
  }
}
