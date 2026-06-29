// src/features/community/services/community.service.ts

import { apiClient } from "@/src/core/api/axios";

import type {
  ActivateCommunityPostResponse,
  BlockCommentResponse,
  CommunityPostListResponse,
  CommunityPostResponse,
  CreateCommunityPostRequest,
  DeactivateCommunityPostResponse,
  DeleteResponse,
  RestoreCommunityPostResponse,
  UnblockCommentResponse,
  UpdateCommunityPostRequest,
} from "@/src/features/community/types/community.types";

class CommunityService {
  async getCommunityPosts() {
    const { data } =
      await apiClient.get<CommunityPostListResponse>(
        "/admin/community-posts",
      );

    return data;
  }

  async getCommunityPost(id: string) {
    const { data } =
      await apiClient.get<CommunityPostResponse>(
        `/admin/community-posts/${id}`,
      );

    return data;
  }

  async createCommunityPost(
    payload: CreateCommunityPostRequest,
  ) {
    const { data } =
      await apiClient.post<CommunityPostResponse>(
        "/admin/community-posts",
        payload,
      );

    return data;
  }

  async updateCommunityPost(
    id: string,
    payload: UpdateCommunityPostRequest,
  ) {
    const { data } =
      await apiClient.patch<CommunityPostResponse>(
        `/admin/community-posts/${id}`,
        payload,
      );

    return data;
  }

  async activateCommunityPost(
    id: string,
  ) {
    const { data } =
      await apiClient.patch<ActivateCommunityPostResponse>(
        `/admin/community-posts/${id}/activate`,
      );

    return data;
  }

  async deactivateCommunityPost(
    id: string,
  ) {
    const { data } =
      await apiClient.patch<DeactivateCommunityPostResponse>(
        `/admin/community-posts/${id}/deactivate`,
      );

    return data;
  }

  async restoreCommunityPost(
    id: string,
  ) {
    const { data } =
      await apiClient.patch<RestoreCommunityPostResponse>(
        `/admin/community-posts/${id}/restore`,
      );

    return data;
  }

  async deleteCommunityPost(
    id: string,
  ) {
    const { data } =
      await apiClient.delete<DeleteResponse>(
        `/admin/community-posts/${id}`,
      );

    return data;
  }

  async permanentlyDeleteCommunityPost(
    id: string,
  ) {
    const { data } =
      await apiClient.delete<DeleteResponse>(
        `/admin/community-posts/${id}/permanent`,
      );

    return data;
  }

  async blockComment(
    id: string,
  ) {
    const { data } =
      await apiClient.patch<BlockCommentResponse>(
        `/admin/community-comments/${id}/block`,
      );

    return data;
  }

  async unblockComment(
    id: string,
  ) {
    const { data } =
      await apiClient.patch<UnblockCommentResponse>(
        `/admin/community-comments/${id}/unblock`,
      );

    return data;
  }

  async deleteComment(
    id: string,
  ) {
    const { data } =
      await apiClient.delete<DeleteResponse>(
        `/admin/community-comments/${id}`,
      );

    return data;
  }

  async restoreComment(
    id: string,
  ) {
    const { data } =
      await apiClient.patch<BlockCommentResponse>(
        `/admin/community-comments/${id}/restore`,
      );

    return data;
  }
}

export const communityService =
  new CommunityService();