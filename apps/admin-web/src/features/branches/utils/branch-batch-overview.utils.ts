import type { Batch, BatchMode } from "@/src/features/batches/types/batch.types";
import { getBatchDisplayStatus } from "@/src/features/batches/utils/batch-select.utils";
import {
  getBatchTimings,
  getBatchTimingsCount,
} from "@/src/features/batches/utils/batch-timing.utils";
import { getTimingsForMode } from "@/src/features/batches/utils/batch-mode.utils";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

export interface BranchBatchOverviewStats {
  totalBatches: number;
  totalStudents: number;
  offlineBatches: number;
  onlineBatches: number;
  recordedBatches: number;
  activeUpcomingBatches: number;
  ongoingBatches: number;
  expiredBatches: number;
}

function sumTimingStudents(batches: Batch[]): number {
  return batches.reduce(
    (batchTotal, batch) =>
      batchTotal +
      getBatchTimings(batch).reduce(
        (timingTotal, timing) => timingTotal + (timing.studentsCount ?? 0),
        0,
      ),
    0,
  );
}

function countUniqueEnrollmentStudents(
  batches: Batch[],
  enrollments: Enrollment[],
): number {
  const batchIds = new Set(batches.map((batch) => batch.id));
  const studentIds = new Set<string>();

  for (const enrollment of enrollments) {
    if (!batchIds.has(enrollment.batch.id)) {
      continue;
    }
    if (enrollment.isDeleted) {
      continue;
    }
    studentIds.add(enrollment.student.id);
  }

  return studentIds.size;
}

function batchHasMode(batch: Batch, mode: BatchMode): boolean {
  return getTimingsForMode(batch, mode).length > 0;
}

export function computeBranchBatchOverviewStats(
  batches: Batch[],
  enrollments: Enrollment[] = [],
): BranchBatchOverviewStats {
  const timingStudentTotal = sumTimingStudents(batches);
  const totalStudents =
    timingStudentTotal > 0
      ? timingStudentTotal
      : countUniqueEnrollmentStudents(batches, enrollments);

  let offlineBatches = 0;
  let onlineBatches = 0;
  let recordedBatches = 0;
  let activeUpcomingBatches = 0;
  let ongoingBatches = 0;
  let expiredBatches = 0;

  for (const batch of batches) {
    if (batchHasMode(batch, "OFFLINE")) {
      offlineBatches += 1;
    }
    if (batchHasMode(batch, "ONLINE")) {
      onlineBatches += 1;
    }
    if (batchHasMode(batch, "RECORDED")) {
      recordedBatches += 1;
    }

    const displayStatus = getBatchDisplayStatus(batch);

    if (displayStatus.key === "UPCOMING") {
      activeUpcomingBatches += 1;
    } else if (displayStatus.key === "ONGOING") {
      ongoingBatches += 1;
    } else if (
      displayStatus.key === "EXPIRED" ||
      displayStatus.key === "COMPLETED"
    ) {
      expiredBatches += 1;
    }
  }

  return {
    totalBatches: batches.length,
    totalStudents,
    offlineBatches,
    onlineBatches,
    recordedBatches,
    activeUpcomingBatches,
    ongoingBatches,
    expiredBatches,
  };
}

export function getBranchBatchTotalTimings(batches: Batch[]): number {
  return batches.reduce(
    (total, batch) => total + getBatchTimingsCount(batch),
    0,
  );
}
