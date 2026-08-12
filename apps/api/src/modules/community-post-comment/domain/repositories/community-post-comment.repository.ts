import { CommunityPostComment } from '../entities/community-post-comment.entity';

export interface CommunityPostCommentUserView {
  id: string;
  name: string;
  profileImage: string | null;
}

export interface CommunityPostCommentView {
  id: string;
  postId: string;
  content: string;
  user: CommunityPostCommentUserView;
  replies: CommunityPostCommentView[];
  isBlocked?: boolean;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityPostCommentRepository {
  save(comment: CommunityPostComment): Promise<void>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<CommunityPostComment | null>;
  findViewById(
    id: string,
    includeBlocked?: boolean,
    includeDeleted?: boolean,
  ): Promise<CommunityPostCommentView | null>;
  findNestedByPostId(
    postId: string,
    includeBlocked?: boolean,
  ): Promise<CommunityPostCommentView[]>;
  countActiveByPostId(postId: string): Promise<number>;
}
