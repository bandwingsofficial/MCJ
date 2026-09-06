import type { BatchManageTabKey } from "@/src/features/batches/components/manage/batch-manage-workspace";

export const BATCH_MANAGE_DEFAULT_TAB: BatchManageTabKey = "overview";

export function batchManagePath(batchId: string): string {
  return `/batches/${batchId}/manage`;
}

/** Second-level management page: always carries both ids. */
export function batchTimingManagePath(
  batchId: string,
  batchTimingId: string,
): string {
  return `/batches/${batchId}/timings/${batchTimingId}/manage`;
}
