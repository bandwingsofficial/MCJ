"use client";

import { useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { formatBatchLabel } from "@/src/features/branch-ops/utils/batch-display";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

import { resolveDashboardDateRange } from "../utils/dashboard-date.utils";
import type {
  DashboardFilterState,
  DashboardQueryParams,
} from "../types/facultyDashboard.types";

const DEFAULT_FILTERS = (): DashboardFilterState => ({
  datePreset: "TODAY",
  customFrom: "",
  customTo: "",
  batchId: "ALL",
  batchCourseId: "ALL",
  assessmentType: "ALL",
});

export function useDashboardFilters() {
  const [filters, setFilters] = useState<DashboardFilterState>(DEFAULT_FILTERS);

  const dateRange = useMemo(
    () =>
      resolveDashboardDateRange(
        filters.datePreset,
        filters.customFrom,
        filters.customTo,
      ),
    [filters.datePreset, filters.customFrom, filters.customTo],
  );

  const queryParams = useMemo<DashboardQueryParams>(
    () => ({
      from: dateRange.from,
      to: dateRange.to,
      batchId: filters.batchId === "ALL" ? undefined : filters.batchId,
      batchCourseId:
        filters.batchCourseId === "ALL" ? undefined : filters.batchCourseId,
      assessmentType:
        filters.assessmentType === "ALL" ? undefined : filters.assessmentType,
    }),
    [
      dateRange.from,
      dateRange.to,
      filters.batchId,
      filters.batchCourseId,
      filters.assessmentType,
    ],
  );

  const batchesQuery = useAsyncData(() => branchOpsApi.batches(), []);

  const sessionsQuery = useAsyncData(
    () =>
      filters.batchId !== "ALL"
        ? branchOpsApi.batchSessions(filters.batchId)
        : Promise.resolve([]),
    [filters.batchId],
  );

  const batchOptions = useMemo(
    () => [
      { label: "All Batches", value: "ALL" },
      ...(batchesQuery.data ?? []).map((batch) => ({
        label: formatBatchLabel(batch.name, batch.code),
        value: batch.id,
      })),
    ],
    [batchesQuery.data],
  );

  const sessionOptions = useMemo(
    () => [
      { label: "All Sessions", value: "ALL" },
      ...(sessionsQuery.data ?? []).map((session) => ({
        label: session.label,
        value: session.batchCourseId,
      })),
    ],
    [sessionsQuery.data],
  );

  const updateFilters = (patch: Partial<DashboardFilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      if (patch.batchId && patch.batchId !== prev.batchId) {
        next.batchCourseId = "ALL";
      }
      return next;
    });
  };

  const clearFilters = () => setFilters(DEFAULT_FILTERS());

  return {
    filters,
    dateRange,
    queryParams,
    batchOptions,
    sessionOptions,
    updateFilters,
    clearFilters,
  };
}
