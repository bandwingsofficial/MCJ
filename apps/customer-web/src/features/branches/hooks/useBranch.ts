"use client";

import { useQuery } from "@tanstack/react-query";

import { branchService } from "@/src/features/branches/services/branch.service";

export function useBranch(branchId: string | undefined) {
  return useQuery({
    queryKey: ["branch", branchId],
    queryFn: () => branchService.getBranch(branchId!),
    enabled: Boolean(branchId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useBranchBySlugOrId(slugOrId: string | undefined) {
  const branchQuery = useQuery({
    queryKey: ["branch", slugOrId],
    queryFn: () => branchService.getBranch(slugOrId!),
    enabled: Boolean(slugOrId),
    staleTime: 1000 * 60 * 5,
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
