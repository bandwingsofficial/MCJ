"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { communityApi } from "@/src/features/community/api/community.api";
import { communityService } from "@/src/features/community/services/community.service";

export const useDeactivateCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      communityService.deactivateCommunityPost(id),

    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: communityApi.lists(),
      });

      void queryClient.invalidateQueries({
        queryKey: communityApi.detail(id),
      });
    },
  });
};