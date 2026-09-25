import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  BranchDashboardQuery,
  BranchManagerDashboardData,
} from "@/src/features/dashboard/types/branch-dashboard.types";

export const branchDashboardService = {
  async getDashboard(
    query: BranchDashboardQuery,
  ): Promise<BranchManagerDashboardData> {
    const data = await branchOpsApi.dashboard({
      preset: query.preset,
      from: query.from,
      to: query.to,
    });
    return data as unknown as BranchManagerDashboardData;
  },
};
