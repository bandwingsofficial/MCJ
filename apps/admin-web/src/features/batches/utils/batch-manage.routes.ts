import type { BatchManageTabKey } from "@/src/features/batches/components/manage/batch-manage-workspace";
import type { BatchMode } from "@/src/features/batches/types/batch.types";
import { isBatchMode } from "@/src/features/batches/utils/batch-mode.utils";

export const BATCH_MANAGE_DEFAULT_TAB: BatchManageTabKey = "overview";

export function batchManagePath(batchId: string): string {
  return `/batches/${batchId}/manage`;
}

export function batchModeManagePath(batchId: string, mode: BatchMode): string {
  return `/batches/${batchId}/modes/${mode.toLowerCase()}/manage`;
}

export function parseBatchModeParam(value: string): BatchMode | null {
  const normalized = value.trim().toUpperCase();
  return isBatchMode(normalized) ? normalized : null;
}

/** Second-level management page: always carries both ids. */
export function batchTimingManagePath(
  batchId: string,
  batchTimingId: string,
): string {
  return `/batches/${batchId}/timings/${batchTimingId}/manage`;
}

export function batchCalendarPath(batchId: string, mode: BatchMode): string {
  return `/batches/${batchId}/calendar/${mode.toLowerCase()}`;
}
