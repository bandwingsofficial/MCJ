"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { communityApi } from "@/src/features/community/api/community.api";
import { communityService } from "@/src/features/community/services/community.service";

import type {
  CreateCommunityPostRequest,
} from "@/src/features/community/types/community.types";

export const useCreateCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: CreateCommunityPostRequest,
    ) => communityService.createCommunityPost(payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: communityApi.lists(),
      });
    },
  });
};