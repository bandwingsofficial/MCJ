import {
  CommunityPostMedia as PrismaCommunityPostMedia,
  CommunityPost as PrismaCommunityPost,
  Upload,
} from '@prisma/client';

import { CommunityPostMedia } from '../../domain/entities/community-post-media.entity';
import { CommunityPost } from '../../domain/entities/community-post.entity';
import { CommunityPostStatus } from '../../domain/enums/community-post-status.enum';
import { CommunityPostType } from '../../domain/enums/community-post-type.enum';

export type CommunityPostWithMedia = PrismaCommunityPost & {
  mediaItems?: Array<
    PrismaCommunityPostMedia & {
      upload?: Upload | null;
    }
  >;
};

export class CommunityPostMapper {
  static toDomain(record: CommunityPostWithMedia): CommunityPost {
    return CommunityPost.reconstitute({
      id: record.id,
      type: record.type as CommunityPostType,
      caption: record.caption,
      mediaFileId: record.mediaFileId,
      mediaUrl: record.mediaUrl,
      thumbnailUrl: record.thumbnailUrl,
      primaryMediaFileId: record.primaryMediaFileId,
      mediaItems: (record.mediaItems ?? []).map((item) =>
        CommunityPostMedia.create({
          id: item.id,
          postId: item.postId,
          fileId: item.fileId,
          mediaType: item.mediaType as CommunityPostType,
          displayOrder: item.displayOrder,
          isPrimary: item.isPrimary,
          url: item.upload?.url ?? null,
          mimeType: item.upload?.mimeType ?? null,
        }),
      ),
      hashtags: record.hashtags,
      mentions: record.mentions,
      authorName: record.authorName,
      location: record.location,
      ctaEnabled: record.ctaEnabled,
      ctaLabel: record.ctaLabel,
      ctaUrl: record.ctaUrl,
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
      primaryMediaFileId: post.primaryMediaFileId,
      hashtags: post.hashtags,
      mentions: post.mentions,
      authorName: post.authorName,
      location: post.location.getValue(),
      ctaEnabled: post.ctaEnabled,
      ctaLabel: post.ctaLabel,
      ctaUrl: post.ctaUrl,
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
