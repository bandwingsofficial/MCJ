import type { Batch } from "@/src/features/batches/types/batch.types";

export interface BatchListData {
  items: Batch[];
  count: number;
}

export interface BatchFilters {
  courseId?: string;
  branchId?: string;
  search?: string;
}
