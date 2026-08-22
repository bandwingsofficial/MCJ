import { batchApi } from "@/src/features/batches/api/batch.api";
import type { BatchFilters } from "@/src/features/batches/types/batch-list.types";

class BatchService {
  async getBatches(filters?: BatchFilters) {
    const response = await batchApi.getBatches(filters);
    const payload = response.data.data;

    return payload?.items ?? [];
  }

  async getBatch(id: string) {
    const response = await batchApi.getBatch(id);
    return response.data.data;
  }
}

export const batchService = new BatchService();
