"use client";

import { useCallback, useEffect, useState } from "react";

import { communityService } from "@/src/features/community/services/community.service";

import { DEFAULT_COMMUNITY_PAGE_SIZE } from "@/src/features/community/constants/community.constants";

import type { CommunityPostLike } from "@/src/features/community/types/community.types";

interface UseCommunityPostLikesReturn {
  likes: CommunityPostLike[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

export function useCommunityPostLikes(
  postId: string,
  options?: { pageSize?: number },
): UseCommunityPostLikesReturn {
  const pageSize = options?.pageSize ?? DEFAULT_COMMUNITY_PAGE_SIZE;
  const [likes, setLikes] = useState<CommunityPostLike[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLikes = useCallback(async () => {
    if (!postId) {
      return;
    }

    try {
      setIsLoading(true);
      const skip = (page - 1) * pageSize;
      const response = await communityService.getPostLikes(postId, {
        skip,
        take: pageSize,
      });

      setLikes(response.data);
      setTotal(response.meta?.total ?? response.data.length);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch post likes",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, postId]);

  useEffect(() => {
    void fetchLikes();
  }, [fetchLikes]);

  return {
    likes,
    total,
    page,
    pageSize,
    isLoading,
    error,
    setPage,
    refetch: fetchLikes,
  };
}
