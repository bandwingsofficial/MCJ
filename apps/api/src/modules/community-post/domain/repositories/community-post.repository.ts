import { CommunityPost } from '../entities/community-post.entity';
import { CommunityPostStatus } from '../enums/community-post-status.enum';
import { CommunityPostType } from '../enums/community-post-type.enum';

export interface CommunityPostListFilters {
  status?: CommunityPostStatus;
  type?: CommunityPostType;
  search?: string;
  includeDeleted?: boolean;
  isDeleted?: boolean;
  isActive?: boolean;
  onlyPublished?: boolean;
  skip?: number;
  take?: number;
}

export interface CommunityPostRepository {
  save(post: CommunityPost): Promise<void>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<CommunityPost | null>;
  findMany(filters?: CommunityPostListFilters): Promise<CommunityPost[]>;
  count(filters?: CommunityPostListFilters): Promise<number>;
  findPublished(filters?: CommunityPostListFilters): Promise<CommunityPost[]>;
  incrementViewCount(id: string): Promise<void>;
  incrementShareCount(id: string): Promise<void>;
  incrementLikeCount(id: string): Promise<void>;
  decrementLikeCount(id: string): Promise<void>;
  incrementCommentCount(id: string): Promise<void>;
  decrementCommentCount(id: string): Promise<void>;
  softDeleteCascade(id: string, deletedBy?: string | null): Promise<void>;
  restoreCascade(id: string, updatedBy?: string | null): Promise<void>;
  permanentDeleteCascade(id: string): Promise<void>;
}
