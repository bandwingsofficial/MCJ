import { apiClient } from "@/src/core/api/axios";

import type {
  AdminDashboardQuery,
  AdminDashboardResponse,
} from "@/src/features/dashboard/types/admin-dashboard.types";

class AdminDashboardService {
  async getDashboard(params: AdminDashboardQuery) {
    const { data } = await apiClient.get<AdminDashboardResponse>(
      "/admin/dashboard",
      {
        params: {
          preset: params.preset,
          from: params.from || undefined,
          to: params.to || undefined,
        },
      },
    );

    return data.data;
  }
}

export const adminDashboardService = new AdminDashboardService();
