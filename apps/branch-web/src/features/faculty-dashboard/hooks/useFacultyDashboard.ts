"use client";

import { useCallback } from "react";

import { useCurrentBranchId } from "@/src/features/auth/hooks/use-current-branch";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

import { fetchFacultyDashboard } from "../services/facultyDashboardService";
import type { DashboardQueryParams } from "../types/facultyDashboard.types";

export function useFacultyDashboard(queryParams: DashboardQueryParams) {
  const branchId = useCurrentBranchId();
  const loader = useCallback(
    () => fetchFacultyDashboard(queryParams),
    [
      branchId,
      queryParams.from,
      queryParams.to,
      queryParams.batchId,
      queryParams.batchCourseId,
      queryParams.assessmentType,
    ],
  );

  return useAsyncData(loader, [
    branchId,
    queryParams.from,
    queryParams.to,
    queryParams.batchId,
    queryParams.batchCourseId,
    queryParams.assessmentType,
  ]);
}
