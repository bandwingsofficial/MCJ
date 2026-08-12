import { CommunityPostLike } from '../entities/community-post-like.entity';

export interface CommunityPostLikeUserView {
  id: string;
  name: string;
  profileImage: string | null;
}

export interface CommunityPostLikeView {
  id: string;
  postId: string;
  userId: string;
  user: CommunityPostLikeUserView;
  createdAt: Date;
}

export interface CommunityPostLikeRepository {
  save(like: CommunityPostLike): Promise<void>;
  deleteByPostAndUser(postId: string, userId: string): Promise<boolean>;
  findActiveByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<CommunityPostLike | null>;
  existsActiveByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<boolean>;
  findViewsByPostId(postId: string): Promise<CommunityPostLikeView[]>;
}
