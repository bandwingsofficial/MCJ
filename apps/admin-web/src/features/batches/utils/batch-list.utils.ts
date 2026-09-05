import type {
  BatchFilters,
  BatchListItem,
  BatchListResponse,
} from "@/src/features/batches/types/batch.types";
import { BATCH_SELECT_ALL } from "@/src/features/batches/utils/batch-select.utils";

/** Operational Active / Inactive filter (isActive). */
export type BatchStatusFilterValue = "ACTIVE" | "INACTIVE";

/** Archive filter in the batches list filter row. */
export type BatchArchiveFilterValue = "ACTIVE" | "ARCHIVED";

export function getBatchStatusFilterValue(
  filters: Pick<BatchFilters, "status">,
): BatchStatusFilterValue | typeof BATCH_SELECT_ALL {
  if (filters.status === "ACTIVE" || filters.status === "INACTIVE") {
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
      isActive: undefined,
      page: 1,
    };
  }

  return {
    ...filters,
    status: value,
    isActive: undefined,
    page: 1,
  };
}

export function getBatchArchiveFilterValue(
  filters: Pick<BatchFilters, "isDeleted">,
): BatchArchiveFilterValue | typeof BATCH_SELECT_ALL {
  if (filters.isDeleted === true) {
    return "ARCHIVED";
  }

  if (filters.isDeleted === false) {
    return "ACTIVE";
  }

  return BATCH_SELECT_ALL;
}

export function applyBatchArchiveFilter(
  filters: BatchFilters,
  value: BatchArchiveFilterValue | typeof BATCH_SELECT_ALL,
): BatchFilters {
  if (value === BATCH_SELECT_ALL) {
    return {
      ...filters,
      isDeleted: undefined,
      page: 1,
    };
  }

  return {
    ...filters,
    isDeleted: value === "ARCHIVED",
    page: 1,
  };
}

export function buildBatchListQueryParams(filters?: BatchFilters) {
  const page = filters?.page ?? 1;
  const pageSize = Math.min(filters?.pageSize ?? 20, 100);
  const skip = (page - 1) * pageSize;
  const status = filters?.status;

  const params: Record<string, unknown> = {
    search: filters?.search?.trim() || undefined,
    courseId: filters?.courseId || undefined,
    categoryId: filters?.categoryId || undefined,
    branchId: filters?.branchId || undefined,
    mode: filters?.mode || undefined,
    status: filters?.batchStatus || undefined,
    skip,
    take: pageSize,
    includeDeleted: true,
  };

  if (filters?.isDeleted === true) {
    params.isDeleted = true;
  } else if (filters?.isDeleted === false) {
    params.isDeleted = false;
  }

  if (status === "ACTIVE") {
    params.isActive = true;
  } else if (status === "INACTIVE") {
    params.isActive = false;
  } else if (filters?.isActive !== undefined) {
    params.isActive = filters.isActive;
  }

  return params;
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

export function getBatchEmptyMessage(filters: BatchFilters): string {
  const lifecycle = filters.batchStatus;
  const archive = getBatchArchiveFilterValue(filters);

  const lifecycleLabel =
    lifecycle === "UPCOMING"
      ? "upcoming"
      : lifecycle === "ONGOING"
        ? "ongoing"
        : lifecycle === "EXPIRED"
          ? "expired"
          : null;

  if (archive === "ARCHIVED") {
    return lifecycleLabel
      ? `No archived ${lifecycleLabel} batches.`
      : "No archived batches.";
  }

  if (archive === "ACTIVE") {
    return lifecycleLabel
      ? `No active ${lifecycleLabel} batches.`
      : "No active batches.";
  }

  switch (lifecycle) {
    case "UPCOMING":
      return "No upcoming batches.";
    case "ONGOING":
      return "No ongoing batches.";
    case "EXPIRED":
      return "No expired batches.";
    default:
      break;
  }

  const hasActiveFilters = Boolean(
    (filters.search ?? "").trim() ||
      filters.courseId ||
      filters.mode ||
      filters.status !== undefined ||
      filters.isDeleted !== undefined,
  );

  if (hasActiveFilters) {
    return "No batches match your filters.";
  }

  return "No batches found.";
}
