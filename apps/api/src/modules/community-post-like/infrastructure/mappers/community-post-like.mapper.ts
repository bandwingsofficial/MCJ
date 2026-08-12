import { CommunityPostLike as PrismaLike } from '@prisma/client';

import { CommunityPostLike } from '../../domain/entities/community-post-like.entity';

export class CommunityPostLikeMapper {
  static toDomain(record: PrismaLike): CommunityPostLike {
    return CommunityPostLike.reconstitute({
      id: record.id,
      postId: record.postId,
      userId: record.userId,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      createdAt: record.createdAt,
    });
  }

  static toPersistence(like: CommunityPostLike) {
    return {
      id: like.id,
      postId: like.postId,
      userId: like.userId,
      isDeleted: like.isDeleted,
      deletedAt: like.deletedAt,
      createdAt: like.createdAt,
    };
  }
}
