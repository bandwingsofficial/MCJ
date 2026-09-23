"use client";

import { useQuery } from "@tanstack/react-query";

import { adminDashboardService } from "@/src/features/dashboard/services/admin-dashboard.service";
import type { AdminDashboardQuery } from "@/src/features/dashboard/types/admin-dashboard.types";

export function useAdminDashboard(query: AdminDashboardQuery) {
  return useQuery({
    queryKey: ["admin-dashboard", query],
    queryFn: () => adminDashboardService.getDashboard(query),
    staleTime: 60_000,
  });
}
