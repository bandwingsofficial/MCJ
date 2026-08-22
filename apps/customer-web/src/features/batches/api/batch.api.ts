import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type { Batch } from "@/src/features/batches/types/batch.types";
import type {
  BatchFilters,
  BatchListData,
} from "@/src/features/batches/types/batch-list.types";

export const batchApi = {
  getBatches(filters?: BatchFilters) {
    return apiClient.get<ApiResponse<BatchListData>>("/batches", {
      params: filters,
    });
  },

  getBatch(id: string) {
    return apiClient.get<ApiResponse<Batch>>(`/batches/${id}`);
  },
};
