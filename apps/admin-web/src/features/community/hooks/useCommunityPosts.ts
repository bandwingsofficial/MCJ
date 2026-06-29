"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { communityService } from "@/src/features/community/services/community.service";

import type {
  CommunityPost,
} from "@/src/features/community/types/community.types";

export interface CommunityPostFilters {
  search: string;

  status: string;

  type: string;

  includeDeleted: boolean;
}

interface UseCommunityPostsReturn {
  posts: CommunityPost[];

  isLoading: boolean;

  error: string | null;

  filters: CommunityPostFilters;

  setFilters: (
    filters: CommunityPostFilters,
  ) => void;

  refetch: () => Promise<void>;
}

export const useCommunityPosts =
  (): UseCommunityPostsReturn => {
    const [posts, setPosts] =
      useState<CommunityPost[]>([]);

    const [isLoading, setIsLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(null);

    const [filters, setFilters] =
      useState<CommunityPostFilters>({
        search: "",

        status: "",

        type: "",

        includeDeleted: false,
      });

    const fetchPosts =
      useCallback(async () => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await communityService.getCommunityPosts();

          setPosts(response.data);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch community posts";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, []);

    useEffect(() => {
      void fetchPosts();
    }, [fetchPosts]);

    return {
      posts,

      isLoading,

      error,

      filters,

      setFilters,

      refetch: fetchPosts,
    };
  };