import type { Batch } from "@/src/features/batches/types/batch.types";

export interface BatchListData {
  items: Batch[];
  count: number;
}

import type { BatchStatus } from "@/src/features/batches/types/batch.types";

export interface BatchFilters {
  courseId?: string;
  branchId?: string;
  status?: BatchStatus;
  search?: string;
  skip?: number;
  take?: number;
}
