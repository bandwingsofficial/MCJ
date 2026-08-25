export const batchMapper = {
  toForm(batch: import("@/src/features/batches/types/batch.types").Batch) {
    const startDate = batch.startDate.split("T")[0]!;
    const endDate = (batch.endDate ?? batch.startDate).split("T")[0]!;

    return {
      name: batch.name,
      code: batch.code,
      description: batch.description ?? "",
      startDate,
      endDate,
      startTime: batch.startTime,
      endTime: batch.endTime,
      daysOfWeek: batch.daysOfWeek,
      capacity: batch.capacity,
      enrolledCount: batch.enrolledCount,
      mode: batch.mode,
      isFeatured: batch.isFeatured,
    };
  },
};
