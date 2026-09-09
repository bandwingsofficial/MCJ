import type { BatchMode } from "./batch-mode.utils";
import { isBatchMode } from "./batch-mode.utils";

export type BatchManageTabKey = "overview" | "course" | "details" | "timings";

export const BATCH_MANAGE_DEFAULT_TAB: BatchManageTabKey = "overview";

export function batchManagePath(batchId: string): string {
  return `/batches/${batchId}`;
}

export function batchModeManagePath(batchId: string, mode: BatchMode): string {
  return `/batches/${batchId}/modes/${mode.toLowerCase()}/manage`;
}

export function parseBatchModeParam(value: string): BatchMode | null {
  const normalized = value.trim().toUpperCase();
  return isBatchMode(normalized) ? normalized : null;
}

export function batchTimingManagePath(
  batchId: string,
  batchTimingId: string,
): string {
  return `/batches/${batchId}/timings/${batchTimingId}/manage`;
}
