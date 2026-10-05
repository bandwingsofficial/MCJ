"use client";

import { useCallback, useEffect, useState } from "react";

import { communityService } from "@/src/features/community/services/community.service";

import { DEFAULT_COMMUNITY_PAGE_SIZE } from "@/src/features/community/constants/community.constants";

import type { CommunityPostShare } from "@/src/features/community/types/community.types";

interface UseCommunityPostSharesReturn {
  shares: CommunityPostShare[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

export function useCommunityPostShares(
  postId: string,
  options?: { enabled?: boolean },
): UseCommunityPostSharesReturn {
  const enabled = options?.enabled ?? true;
  const [shares, setShares] = useState<CommunityPostShare[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = DEFAULT_COMMUNITY_PAGE_SIZE;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!postId || !enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await communityService.getPostShares(postId, {
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      setShares(response.data);
      setTotal(response.meta?.total ?? response.data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shares");
    } finally {
      setIsLoading(false);
    }
  }, [enabled, page, pageSize, postId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    shares,
    total,
    page,
    pageSize,
    isLoading,
    error,
    setPage,
    refetch,
  };
}
