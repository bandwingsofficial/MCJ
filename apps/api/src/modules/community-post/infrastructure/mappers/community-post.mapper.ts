import { CommunityPost as PrismaCommunityPost } from '@prisma/client';

import { CommunityPost } from '../../domain/entities/community-post.entity';
import { CommunityPostStatus } from '../../domain/enums/community-post-status.enum';
import { CommunityPostType } from '../../domain/enums/community-post-type.enum';

export class CommunityPostMapper {
  static toDomain(record: PrismaCommunityPost): CommunityPost {
    return CommunityPost.reconstitute({
      id: record.id,
      type: record.type as CommunityPostType,
      caption: record.caption,
      mediaFileId: record.mediaFileId,
      mediaUrl: record.mediaUrl,
      thumbnailUrl: record.thumbnailUrl,
      hashtags: record.hashtags,
      mentions: record.mentions,
      location: record.location,
      viewCount: record.viewCount,
      likeCount: record.likeCount,
      commentCount: record.commentCount,
      shareCount: record.shareCount,
      status: record.status as CommunityPostStatus,
      isActive: record.isActive,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      deletedBy: record.deletedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(post: CommunityPost) {
    return {
      id: post.id,
      type: post.type,
      caption: post.caption.getValue(),
      mediaFileId: post.mediaFileId,
      mediaUrl: post.mediaUrl.getValue(),
      thumbnailUrl: post.thumbnailUrl.getValue(),
      hashtags: post.hashtags,
      mentions: post.mentions,
      location: post.location.getValue(),
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      shareCount: post.shareCount,
      status: post.status,
      isActive: post.isActive,
      createdBy: post.createdBy,
      updatedBy: post.updatedBy,
      isDeleted: post.isDeleted,
      deletedAt: post.deletedAt,
      deletedBy: post.deletedBy,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
