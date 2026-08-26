import { batchApi } from "@/src/features/batches/api/batch.api";
import type { Batch } from "@/src/features/batches/types/batch.types";
import type { BatchFilters } from "@/src/features/batches/types/batch-list.types";

const MAX_BATCH_PAGE_SIZE = 100;

class BatchService {
  async getBatches(filters?: BatchFilters) {
    const response = await batchApi.getBatches(filters);
    const payload = response.data.data;

    return payload?.items ?? [];
  }

  async getAllBatches(filters?: Omit<BatchFilters, "skip" | "take">) {
    const take = MAX_BATCH_PAGE_SIZE;
    let skip = 0;
    const items: Batch[] = [];
    let total = Number.POSITIVE_INFINITY;

    while (items.length < total) {
      const response = await batchApi.getBatches({
        ...filters,
        skip,
        take,
      });
      const payload = response.data.data;
      const pageItems = payload?.items ?? [];
      total = payload?.count ?? pageItems.length;
      items.push(...pageItems);

      if (pageItems.length < take) {
        break;
      }

      skip += take;

      if (skip > 10_000) {
        break;
      }
    }

    return items;
  }

  async getBatch(id: string) {
    const response = await batchApi.getBatch(id);
    return response.data.data;
  }
}

export const batchService = new BatchService();
