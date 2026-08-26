import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type { Batch } from "@/src/features/batches/types/batch.types";
import type {
  BatchFilters,
  BatchListData,
} from "@/src/features/batches/types/batch-list.types";

const MAX_BATCH_PAGE_SIZE = 100;

export const batchApi = {
  getBatches(filters?: BatchFilters) {
    const take = Math.min(filters?.take ?? MAX_BATCH_PAGE_SIZE, MAX_BATCH_PAGE_SIZE);
    const skip = Math.max(filters?.skip ?? 0, 0);

    return apiClient.get<ApiResponse<BatchListData>>("/batches", {
      params: {
        courseId: filters?.courseId,
        branchId: filters?.branchId,
        search: filters?.search,
        skip,
        take,
      },
    });
  },

  getBatch(id: string) {
    return apiClient.get<ApiResponse<Batch>>(`/batches/${id}`);
  },
};
