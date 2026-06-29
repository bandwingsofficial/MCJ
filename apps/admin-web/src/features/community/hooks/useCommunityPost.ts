"use client";

import { useQuery } from "@tanstack/react-query";

import { communityApi } from "@/src/features/community/api/community.api";
import { communityService } from "@/src/features/community/services/community.service";

export const useCommunityPost = (
  id: string,
) => {
  return useQuery({
    queryKey: communityApi.detail(id),

    queryFn: () =>
      communityService.getCommunityPost(id),

    enabled: Boolean(id),

    staleTime: 1000 * 60 * 5,
  });
};