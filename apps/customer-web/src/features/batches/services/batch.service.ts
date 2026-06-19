import { batchApi } from "@/src/features/batches/api/batch.api";

class BatchService {
  async getBatches() {
    const response =
      await batchApi.getBatches();

    return response.data.data;
  }

  async getBatch(
    id: string,
  ) {
    const response =
      await batchApi.getBatch(id);

    return response.data.data;
  }
}

export const batchService =
  new BatchService();