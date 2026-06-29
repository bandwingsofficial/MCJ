"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { communityApi } from "@/src/features/community/api/community.api";
import { communityService } from "@/src/features/community/services/community.service";

export const useBlockComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      communityService.blockComment(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: communityApi.all,
      });
    },
  });
};