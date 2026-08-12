import { CommunityPostType } from '../../domain/enums/community-post-type.enum';
import { CommunityPostStatus } from '../../domain/enums/community-post-status.enum';
import { CommunityPost } from '../../domain/entities/community-post.entity';
import type { CommunityPostCommentView } from '@modules/community-post-comment/domain/repositories/community-post-comment.repository';

export class GetCommunityPostResult {
  constructor(
    public readonly id: string,
    public readonly type: CommunityPostType,
    public readonly caption: string | null,
    public readonly mediaFileId: string | null,
    public readonly mediaUrl: string | null,
    public readonly thumbnailUrl: string | null,
    public readonly hashtags: string[],
    public readonly mentions: string[],
    public readonly location: string | null,
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
    return new GetCommunityPostResult(
      post.id,
      post.type,
      post.caption.getValue(),
      post.mediaFileId,
      post.mediaUrl.getValue(),
      post.thumbnailUrl.getValue(),
      post.hashtags,
      post.mentions,
      post.location.getValue(),
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
