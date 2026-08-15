import type {
  BatchFilters,
  BatchListItem,
  BatchListResponse,
  BatchStatus,
} from "@/src/features/batches/types/batch.types";
import { BATCH_SELECT_ALL } from "@/src/features/batches/utils/batch-select.utils";

/** UI-only filter value for soft-deleted batches (maps to includeDeleted). */
export const DELETED_BATCHES_FILTER = "DELETED" as const;

export type BatchStatusFilterValue =
  | BatchStatus
  | typeof DELETED_BATCHES_FILTER;

export function getBatchStatusFilterValue(
  filters: Pick<BatchFilters, "status" | "includeDeleted">,
): BatchStatusFilterValue | typeof BATCH_SELECT_ALL {
  if (filters.includeDeleted) {
    return DELETED_BATCHES_FILTER;
  }

  if (filters.status) {
    return filters.status;
  }

  return BATCH_SELECT_ALL;
}

export function applyBatchStatusFilter(
  filters: BatchFilters,
  value: BatchStatusFilterValue | typeof BATCH_SELECT_ALL,
): BatchFilters {
  if (value === BATCH_SELECT_ALL) {
    return {
      ...filters,
      status: undefined,
      includeDeleted: false,
    };
  }

  if (value === DELETED_BATCHES_FILTER) {
    return {
      ...filters,
      status: undefined,
      includeDeleted: true,
    };
  }

  return {
    ...filters,
    status: value,
    includeDeleted: false,
  };
}

export function buildBatchListQueryParams(filters?: BatchFilters) {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;
  const includeDeleted = filters?.includeDeleted === true;

  return {
    search: filters?.search?.trim() || undefined,
    courseId: filters?.courseId || undefined,
    branchId: filters?.branchId || undefined,
    trainerId: filters?.trainerId || undefined,
    mode: filters?.mode || undefined,
    status: includeDeleted ? undefined : filters?.status || undefined,
    includeDeleted: includeDeleted ? true : undefined,
    skip,
    take: pageSize,
  };
}

export function parseBatchListResponse(data: unknown): BatchListResponse {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid batch list response");
  }

  const record = data as Record<string, unknown>;
  const items = record.items;

  if (!Array.isArray(items)) {
    throw new Error("Invalid batch list response: items must be an array");
  }

  const count =
    typeof record.count === "number" ? record.count : items.length;

  return {
    items: items as BatchListItem[],
    count,
  };
}
