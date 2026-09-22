import type { BatchManageTabKey } from "@/src/features/batches/components/manage/batch-manage-workspace";
import type { BatchMode } from "@/src/features/batches/types/batch.types";
import { courseManageTabPath } from "@/src/features/courses/utils/course-manage.routes";
import { isBatchMode } from "@/src/features/batches/utils/batch-mode.utils";

export const BATCH_MANAGE_DEFAULT_TAB: BatchManageTabKey = "overview";

export type BatchManageReturnContext =
  | { kind: "batches" }
  | { kind: "course"; courseId: string };

export function batchManagePath(
  batchId: string,
  options?: {
    returnContext?: BatchManageReturnContext;
    tab?: BatchManageTabKey;
  },
): string {
  const base = `/batches/${batchId}/manage`;
  const params = new URLSearchParams();

  if (options?.returnContext?.kind === "course") {
    params.set("from", "course");
    params.set("courseId", options.returnContext.courseId);
  }

  if (options?.tab && options.tab !== BATCH_MANAGE_DEFAULT_TAB) {
    params.set("tab", options.tab);
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function parseBatchManageReturnContext(
  searchParams: Pick<URLSearchParams, "get">,
): BatchManageReturnContext {
  if (searchParams.get("from") === "course") {
    const courseId = searchParams.get("courseId")?.trim();
    if (courseId) {
      return { kind: "course", courseId };
    }
  }
  return { kind: "batches" };
}

export function batchManageBackHref(
  context: BatchManageReturnContext,
): string {
  if (context.kind === "course") {
    return courseManageTabPath(context.courseId, "batches");
  }
  return "/batches";
}

export function batchManageBackLabel(
  context: BatchManageReturnContext,
): string {
  if (context.kind === "course") {
    return "Back to Course Batches";
  }
  return "Back to Batches";
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
  options?: { returnContext?: BatchManageReturnContext },
): string {
  const base = `/batches/${batchId}/timings/${batchTimingId}/manage`;
  const params = new URLSearchParams();

  if (options?.returnContext?.kind === "course") {
    params.set("from", "course");
    params.set("courseId", options.returnContext.courseId);
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function batchTimingManageParentHref(
  batchId: string,
  returnContext: BatchManageReturnContext,
): string {
  return batchManagePath(batchId, { returnContext, tab: "timings" });
}

export function batchTimingManageBackLabel(
  _returnContext: BatchManageReturnContext,
): string {
  return "Back to Batch Manage";
}

export function batchCalendarPath(batchId: string, mode: BatchMode): string {
  return `/batches/${batchId}/calendar/${mode.toLowerCase()}`;
}
