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
  const branchesQuery = useQuery({
    queryKey: ["branches", "all"],
    queryFn: () => branchService.getBranches(),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(slugOrId),
  });

  const matchedBranch =
    branchesQuery.data?.find(
      (branch) =>
        branch.id === slugOrId ||
        branch.branchCode.toLowerCase() === slugOrId?.toLowerCase(),
    ) ?? null;

  const branchQuery = useBranch(matchedBranch?.id);

  return {
    branch: branchQuery.data ?? matchedBranch,
    isLoading: branchesQuery.isLoading || branchQuery.isLoading,
    isError: branchesQuery.isError || branchQuery.isError,
    refetch: () => {
      void branchesQuery.refetch();
      void branchQuery.refetch();
    },
    notFound:
      !branchesQuery.isLoading &&
      !branchQuery.isLoading &&
      !matchedBranch &&
      !branchQuery.data,
  };
}
