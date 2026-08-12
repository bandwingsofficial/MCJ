import { CommunityPostComment as PrismaComment } from '@prisma/client';

import { CommunityPostComment } from '../../domain/entities/community-post-comment.entity';

export class CommunityPostCommentMapper {
  static toDomain(record: PrismaComment): CommunityPostComment {
    return CommunityPostComment.reconstitute({
      id: record.id,
      postId: record.postId,
      userId: record.userId,
      parentId: record.parentId,
      content: record.content,
      isBlocked: record.isBlocked,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(comment: CommunityPostComment) {
    return {
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      parentId: comment.parentId,
      content: comment.content,
      isBlocked: comment.isBlocked,
      isDeleted: comment.isDeleted,
      deletedAt: comment.deletedAt,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
