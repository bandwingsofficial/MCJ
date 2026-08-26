import type {

  BatchFilters,

  BatchListItem,

  BatchListResponse,

} from "@/src/features/batches/types/batch.types";

import { BATCH_SELECT_ALL } from "@/src/features/batches/utils/batch-select.utils";



export type BatchStatusFilterValue = "ACTIVE" | "INACTIVE" | "ARCHIVED";



export function getBatchStatusFilterValue(

  filters: Pick<BatchFilters, "status">,

): BatchStatusFilterValue | typeof BATCH_SELECT_ALL {

  return filters.status ?? BATCH_SELECT_ALL;

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

      isDeleted: undefined,

    };

  }



  return {

    ...filters,

    status: value,

    isActive: undefined,

    isDeleted: undefined,

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

    branchId: filters?.branchId || undefined,

    skip,

    take: pageSize,

    includeDeleted: filters?.includeDeleted === false ? false : true,

  };



  if (filters?.isDeleted !== undefined) {

    params.isDeleted = filters.isDeleted;

  } else if (status === "ACTIVE" || status === "INACTIVE") {

    params.isDeleted = false;

  } else if (status === "ARCHIVED") {

    params.isDeleted = true;

  }



  if (status === "ACTIVE") {

    params.isActive = true;

  } else if (status === "INACTIVE") {

    params.isActive = false;

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

  const hasActiveFilters = Boolean(

    (filters.search ?? "").trim() ||

      filters.courseId ||

      filters.status !== undefined,

  );



  if (hasActiveFilters) {

    return "No batches match your filters.";

  }



  return "No batches found.";

}

