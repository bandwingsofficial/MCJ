export type CommunityPostType = "IMAGE" | "VIDEO";

export type CommunityPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type CommunityManagementStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type CommunityFilterStatus = CommunityManagementStatus;

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

export interface CommunityPostLike {
  id: string;
  postId: string;
  userId: string;
  user: CommunityUser;
  createdAt: string;
}

export interface CommunityPostMediaItem {
  id: string;
  fileId: string;
  mediaType: CommunityPostType;
  url: string | null;
  mimeType?: string | null;
  displayOrder: number | null;
  isPrimary: boolean;
}

export interface CommunityPostListItem {
  id: string;
  type: CommunityPostType;
  caption: string | null;
  mediaFileId: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  primaryMediaFileId?: string | null;
  media?: CommunityPostMediaItem[];
  hashtags: string[];
  mentions: string[];
  authorName: string;
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
}

export interface CommunityPostDetails extends CommunityPostListItem {
  comments: CommunityComment[];
}

export type CommunityPost = CommunityPostDetails;

export interface CommunityFilters {
  search?: string;
  status?: CommunityFilterStatus;
  type?: CommunityPostType;
  includeDeleted?: boolean;
  isDeleted?: boolean;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CommunityListMeta {
  total: number;
  skip: number;
  take: number;
}

export interface CreateCommunityPostRequest {
  type?: CommunityPostType;
  caption?: string;
  mediaFileId?: string;
  media?: Array<{
    id?: string;
    fileId: string;
    mediaType: CommunityPostType;
    displayOrder?: number;
    isPrimary?: boolean;
  }>;
  thumbnailUrl?: string;
  hashtags?: string[];
  mentions?: string[];
  authorName?: string;
  location?: string;
  status?: CommunityPostStatus;
}

export interface UpdateCommunityPostRequest {
  type?: CommunityPostType;
  caption?: string;
  mediaFileId?: string | null;
  media?: Array<{
    id?: string;
    fileId: string;
    mediaType: CommunityPostType;
    displayOrder?: number;
    isPrimary?: boolean;
  }>;
  thumbnailUrl?: string | null;
  hashtags?: string[];
  mentions?: string[];
  location?: string;
  status?: CommunityPostStatus;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface CommunityDeleteResponse {
  id: string;
  deleted: boolean;
  deletedAt: string;
}

export interface CommunityPermanentDeleteResponse {
  id: string;
  permanentlyDeleted: boolean;
}

export interface BulkCommunityItemResult {
  id: string;
  success: boolean;
  message: string;
}

export interface BulkCommunityOperationResult {
  requestedCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  results: BulkCommunityItemResult[];
  failures: BulkCommunityItemResult[];
}

export interface CommunityUploadResponse {
  fileId: string;
  url: string;
}
