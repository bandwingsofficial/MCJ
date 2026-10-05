export interface CommunityPostShareUserView {
  name: string;
  email: string;
  phone: string | null;
}

export interface CommunityPostShareView {
  id: string;
  postId: string;
  sharedAt: Date;
  user: CommunityPostShareUserView;
}

export interface CommunityPostEngagementRepository {
  recordView(postId: string, userId: string): Promise<number>;
  recordShare(postId: string, userId: string): Promise<number>;
  userHasViewedPost(postId: string, userId: string): Promise<boolean>;
  findSharesByPostId(
    postId: string,
    options?: { skip?: number; take?: number },
  ): Promise<CommunityPostShareView[]>;
  countSharesByPostId(postId: string): Promise<number>;
  syncShareCountFromRecords(postId: string): Promise<number>;
}
