import { apiClient } from "@/src/core/api/axios";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

export type PortalCommunityPostType = "IMAGE" | "VIDEO";

export interface PortalCommunityPostMedia {
  id: string;
  fileId: string;
  mediaType: PortalCommunityPostType;
  url: string | null;
  mimeType: string | null;
  displayOrder: number | null;
  isPrimary: boolean;
}

export interface PortalCommunityPost {
  id: string;
  type: PortalCommunityPostType;
  caption: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  media: PortalCommunityPostMedia[];
  hashtags: string[];
  mentions: string[];
  authorName: string;
  location: string | null;
  ctaEnabled: boolean;
  ctaLabel: string | null;
  ctaUrl: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class PortalCommunityService {
  async getPost(postId: string) {
    const response = await apiClient.get<ApiSuccessResponse<PortalCommunityPost>>(
      `/community-posts/${postId}`,
    );
    return response.data.data;
  }

  async recordView(postId: string) {
    const response = await apiClient.post<
      ApiSuccessResponse<{ id: string; viewCount: number }>
    >(`/community-posts/${postId}/view`);
    return response.data.data;
  }

  async recordShare(postId: string) {
    const response = await apiClient.post<
      ApiSuccessResponse<{ id: string; shareCount: number }>
    >(`/community-posts/${postId}/share`);
    return response.data.data;
  }
}

export const portalCommunityService = new PortalCommunityService();

export function getPortalCommunityErrorMessage(error: unknown): string {
  return getErrorMessage(error);
}
