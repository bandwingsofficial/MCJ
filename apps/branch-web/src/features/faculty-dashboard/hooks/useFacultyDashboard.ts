"use client";

import { useCallback } from "react";

import { useAsyncData } from "@/src/shared/hooks/use-async-data";

import { fetchFacultyDashboard } from "../services/facultyDashboardService";
import type { DashboardQueryParams } from "../types/facultyDashboard.types";

export function useFacultyDashboard(queryParams: DashboardQueryParams) {
  const loader = useCallback(
    () => fetchFacultyDashboard(queryParams),
    [
      queryParams.from,
      queryParams.to,
      queryParams.batchId,
      queryParams.batchCourseId,
      queryParams.assessmentType,
    ],
  );

  return useAsyncData(loader, [
    queryParams.from,
    queryParams.to,
    queryParams.batchId,
    queryParams.batchCourseId,
    queryParams.assessmentType,
  ]);
}
