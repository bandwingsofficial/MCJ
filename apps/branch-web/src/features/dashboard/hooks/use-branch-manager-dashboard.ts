"use client";

import { useCurrentBranchId } from "@/src/features/auth/hooks/use-current-branch";
import { branchDashboardService } from "@/src/features/dashboard/services/branch-dashboard.service";
import type { BranchDashboardQuery } from "@/src/features/dashboard/types/branch-dashboard.types";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

export function useBranchManagerDashboard(query: BranchDashboardQuery) {
  const branchId = useCurrentBranchId();

  return useAsyncData(
    () => branchDashboardService.getDashboard(query),
    [branchId, query.preset, query.from, query.to],
  );
}
