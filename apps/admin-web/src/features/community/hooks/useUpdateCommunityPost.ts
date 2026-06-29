"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { communityApi } from "@/src/features/community/api/community.api";
import { communityService } from "@/src/features/community/services/community.service";

import type {
  UpdateCommunityPostRequest,
} from "@/src/features/community/types/community.types";

interface UpdateCommunityPostPayload {
  id: string;

  data: UpdateCommunityPostRequest;
}

export const useUpdateCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: UpdateCommunityPostPayload) =>
      communityService.updateCommunityPost(
        id,
        data,
      ),

    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: communityApi.lists(),
      });

      void queryClient.invalidateQueries({
        queryKey: communityApi.detail(
          variables.id,
        ),
      });
    },
  });
};