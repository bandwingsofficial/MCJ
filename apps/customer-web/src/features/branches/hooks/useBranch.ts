"use client";

import { useQuery } from "@tanstack/react-query";

import { branchService } from "@/src/features/branches/services/branch.service";
import { ENTITY_IMAGE_QUERY_OPTIONS } from "@/src/shared/lib/entity-image-query";

export function useBranch(branchId: string | undefined) {
  return useQuery({
    queryKey: ["branch", branchId],
    queryFn: () => branchService.getBranch(branchId!),
    enabled: Boolean(branchId),
    ...ENTITY_IMAGE_QUERY_OPTIONS,
  });
}

export function useBranchBySlugOrId(slugOrId: string | undefined) {
  const branchQuery = useQuery({
    queryKey: ["branch", slugOrId],
    queryFn: () => branchService.getBranch(slugOrId!),
    enabled: Boolean(slugOrId),
    ...ENTITY_IMAGE_QUERY_OPTIONS,
    retry: false,
  });

  return {
    branch: branchQuery.data ?? null,
    isLoading: branchQuery.isLoading,
    isError: branchQuery.isError,
    refetch: () => {
      void branchQuery.refetch();
    },
    notFound:
      !branchQuery.isLoading &&
      !branchQuery.isFetching &&
      (branchQuery.isError || !branchQuery.data),
  };
}
