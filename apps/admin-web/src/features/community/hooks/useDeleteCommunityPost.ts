"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { communityApi } from "@/src/features/community/api/community.api";
import { communityService } from "@/src/features/community/services/community.service";

export const useDeleteCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      communityService.deleteCommunityPost(id),

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