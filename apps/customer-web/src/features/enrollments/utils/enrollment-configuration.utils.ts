import type { Batch, BatchMode, BatchTiming } from "@/src/features/batches/types/batch.types";
import type { Course } from "@/src/features/courses/types/course.types";
import {
  formatBatchDays,
  formatEnrollmentDate,
  formatEnrollmentTime,
} from "@/src/features/enrollments/utils/enrollment-batch.utils";
import type { EnrollmentTimingSnapshot } from "@/src/features/enrollments/utils/enrollment-selection-storage";

export function resolveEnrollmentTiming(
  batch: Batch | null | undefined,
  batchTimingId?: string | null,
  snapshot?: EnrollmentTimingSnapshot | null,
): BatchTiming | null {
  if (batch && batchTimingId) {
    const fromBatch = (batch.timings ?? []).find(
      (timing) => timing.id === batchTimingId,
    );
    if (fromBatch) {
      return fromBatch;
    }
  }

  if (snapshot && (!batchTimingId || snapshot.id === batchTimingId)) {
    return {
      id: snapshot.id,
      batchId: batch?.id ?? "",
      name: snapshot.name,
      mode: snapshot.mode,
      daysOfWeek: snapshot.daysOfWeek,
      startDate: snapshot.startDate,
      endDate: snapshot.endDate ?? null,
      startTime: snapshot.startTime,
      endTime: snapshot.endTime,
      capacity: batch?.capacity ?? 0,
      enrolledCount: batch?.enrolledCount ?? 0,
      status: batch?.status ?? "UPCOMING",
      isActive: true,
    };
  }

  return null;
}

export function resolveEnrollmentBranchName(params: {
  branchId?: string | null;
  course?: Course | null;
  batch?: Batch | null;
  publicBranchNames?: Map<string, string> | null;
}): string {
  const { branchId, course, batch, publicBranchNames } = params;

  if (!branchId) {
    return "—";
  }

  const fromCourse = course?.branches?.find((branch) => branch.id === branchId)
    ?.branchName?.trim();
  if (fromCourse) {
    return fromCourse;
  }

  if (batch?.branch?.id === branchId && batch.branch.branchName?.trim()) {
    return batch.branch.branchName.trim();
  }

  const fromPublic = publicBranchNames?.get(branchId)?.trim();
  if (fromPublic) {
    return fromPublic;
  }

  return "—";
}

export function formatEnrollmentBatchTimingValue(
  timing: BatchTiming | null,
): { name: string; timeLine: string | null; combined: string } {
  if (!timing) {
    return {
      name: "—",
      timeLine: null,
      combined: "—",
    };
  }

  const name = timing.name?.trim() || "—";
  const isRecorded = timing.mode === "RECORDED";
  const start = formatEnrollmentTime(timing.startTime);
  const end = formatEnrollmentTime(timing.endTime);
  const hasRealTime =
    !isRecorded &&
    Boolean(timing.startTime) &&
    Boolean(timing.endTime) &&
    !(timing.startTime === "00:00" && timing.endTime === "23:59");

  if (!hasRealTime) {
    return {
      name,
      timeLine: isRecorded ? "Flexible / Anytime" : null,
      combined: isRecorded ? `${name} · Flexible / Anytime` : name,
    };
  }

  const timeLine = `${start} – ${end}`;
  return {
    name,
    timeLine,
    combined: `${name} · ${timeLine}`,
  };
}

export function resolveEnrollmentSchedule(params: {
  batch: Batch | null;
  batchTimingId?: string | null;
  mode?: string | null;
  timingSnapshot?: EnrollmentTimingSnapshot | null;
}): {
  timing: BatchTiming | null;
  learningMode: BatchMode | string | null;
  startDate: string;
  days: string;
  batchTimingDisplay: ReturnType<typeof formatEnrollmentBatchTimingValue>;
} {
  const timing = resolveEnrollmentTiming(
    params.batch,
    params.batchTimingId,
    params.timingSnapshot,
  );
  const learningMode =
    timing?.mode ??
    (params.mode ? params.mode.toUpperCase() : null) ??
    params.batch?.mode ??
    null;

  return {
    timing,
    learningMode,
    startDate: formatEnrollmentDate(timing?.startDate),
    days: formatBatchDays(timing?.daysOfWeek ?? []),
    batchTimingDisplay: formatEnrollmentBatchTimingValue(timing),
  };
}
