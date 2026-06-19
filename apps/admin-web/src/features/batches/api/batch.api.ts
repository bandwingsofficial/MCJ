// src/features/batches/api/batch.api.ts

export const batchApi = {
  all: ["batches"] as const,

  lists: () => [...batchApi.all, "list"] as const,

  detail: (id: string) =>
    [...batchApi.all, "detail", id] as const,
};