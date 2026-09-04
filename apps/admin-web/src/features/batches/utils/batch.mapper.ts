import { getBatchPricing } from "@/src/features/batches/utils/batch-pricing.util";

export const batchMapper = {
  toForm(batch: import("@/src/features/batches/types/batch.types").Batch) {
    const startDate = batch.startDate.split("T")[0]!;
    const endDate = (batch.endDate ?? batch.startDate).split("T")[0]!;
    const pricing = getBatchPricing(batch);

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
      originalPrice: pricing.originalPrice,
      discountPercent: pricing.discountPercent,
      discountAmount: pricing.discountAmount,
      currency: pricing.currency,
      isFree: pricing.isFree,
    };
  },
};
