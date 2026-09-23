import { CommunityPostType } from '../../domain/enums/community-post-type.enum';
import { CommunityPostStatus } from '../../domain/enums/community-post-status.enum';
import { CommunityPost } from '../../domain/entities/community-post.entity';
import type { CommunityPostCommentView } from '@modules/community-post-comment/domain/repositories/community-post-comment.repository';

export class CommunityPostMediaResult {
  constructor(
    public readonly id: string,
    public readonly fileId: string,
    public readonly mediaType: CommunityPostType,
    public readonly url: string | null,
    public readonly mimeType: string | null,
    public readonly displayOrder: number | null,
    public readonly isPrimary: boolean,
  ) {}
}

export class GetCommunityPostResult {
  constructor(
    public readonly id: string,
    public readonly type: CommunityPostType,
    public readonly caption: string | null,
    public readonly mediaFileId: string | null,
    public readonly mediaUrl: string | null,
    public readonly thumbnailUrl: string | null,
    public readonly primaryMediaFileId: string | null,
    public readonly media: CommunityPostMediaResult[],
    public readonly hashtags: string[],
    public readonly mentions: string[],
    public readonly authorName: string,
    public readonly location: string | null,
    public readonly ctaEnabled: boolean,
    public readonly ctaLabel: string | null,
    public readonly ctaUrl: string | null,
    public readonly viewCount: number,
    public readonly likeCount: number,
    public readonly commentCount: number,
    public readonly shareCount: number,
    public readonly status: CommunityPostStatus,
    public readonly isActive: boolean,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly comments: CommunityPostCommentView[] = [],
  ) {}

  static fromEntity(
    post: CommunityPost,
    comments: CommunityPostCommentView[] = [],
  ): GetCommunityPostResult {
    const media = [...post.mediaItems]
      .sort(
        (left, right) =>
          (left.displayOrder ?? 0) - (right.displayOrder ?? 0),
      )
      .map(
        (item) =>
          new CommunityPostMediaResult(
            item.id,
            item.fileId,
            item.mediaType,
            item.url,
            item.mimeType,
            item.displayOrder,
            item.isPrimary,
          ),
      );

    return new GetCommunityPostResult(
      post.id,
      post.type,
      post.caption.getValue(),
      post.mediaFileId,
      post.mediaUrl.getValue(),
      post.thumbnailUrl.getValue(),
      post.primaryMediaFileId,
      media,
      post.hashtags,
      post.mentions,
      post.authorName,
      post.location.getValue(),
      post.ctaEnabled,
      post.ctaLabel,
      post.ctaUrl,
      post.viewCount,
      post.likeCount,
      post.commentCount,
      post.shareCount,
      post.status,
      post.isActive,
      post.isDeleted,
      post.deletedAt,
      post.createdAt,
      post.updatedAt,
      comments,
    );
  }
}
