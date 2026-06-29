export type CommunityPostType =
  | "IMAGE"
  | "VIDEO";

export type CommunityPostStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

  export interface CommunityUser {
  id: string;

  name: string;

  profileImage: string | null;
}

export interface CommunityComment {
  id: string;

  postId: string;

  content: string;

  user: CommunityUser;

  replies: CommunityComment[];

  createdAt: string;

  updatedAt: string;

  isBlocked?: boolean;

  isDeleted?: boolean;
}

export interface CommunityPost {
  id: string;

  type: CommunityPostType;

  caption: string;

  mediaFileId: string | null;

  mediaUrl: string | null;

  thumbnailUrl: string | null;

  hashtags: string[];

  mentions: string[];

  location: string | null;

  viewCount: number;

  likeCount: number;

  commentCount: number;

  shareCount: number;

  status: CommunityPostStatus;

  isActive: boolean;

  isDeleted: boolean;

  deletedAt: string | null;

  createdAt: string;

  updatedAt: string;

  comments: CommunityComment[];
}

export interface CreateCommunityPostRequest {
  type: CommunityPostType;

  caption: string;

  mediaUrl: string;

  hashtags: string[];

  mentions: string[];

  location: string;

  status: CommunityPostStatus;
}

export interface UpdateCommunityPostRequest
  extends Partial<CreateCommunityPostRequest> {}

  export interface ApiResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

export type CommunityPostResponse =
  ApiResponse<CommunityPost>;

export type CommunityPostListResponse =
  ApiResponse<CommunityPost[]>;

  export interface DeleteResponse {
  success: boolean;

  message: string;
}

export type RestoreCommunityPostResponse =
  ApiResponse<CommunityPost>;


export type ActivateCommunityPostResponse =
  ApiResponse<CommunityPost>;

  export type DeactivateCommunityPostResponse =
  ApiResponse<CommunityPost>;

  export type BlockCommentResponse =
  ApiResponse<CommunityComment>;

  export type UnblockCommentResponse =
  ApiResponse<CommunityComment>;