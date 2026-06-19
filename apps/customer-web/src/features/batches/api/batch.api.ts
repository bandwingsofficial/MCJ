import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

export const batchApi = {
  getBatches() {
    return apiClient.get<
      ApiResponse<Batch[]>
    >("/batches");
  },

  getBatch(
    id: string,
  ) {
    return apiClient.get<
      ApiResponse<Batch>
    >(`/batches/${id}`);
  },
};