import type { Batch } from "@/src/features/batches/types/batch.types";
import {
  formatBatchDateRange,
  formatBatchTiming,
} from "@/src/features/batches/utils/batch.helper";
import {
  formatBatchTimingNames,
  formatBatchTimingsSummary,
  formatTimingDateRange,
  formatTimingRange,
  getBatchTimings,
  getBatchTotalCapacity,
} from "@/src/features/batches/utils/batch-timing.utils";
import type { BranchListItem } from "@/src/features/branches/types/branch.types";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

export interface CourseManageBatchRow {
  batch: Batch;
  branchId: string;
  branchName: string;
  rowKey: string;
}

export function isLiveBranch(branch: BranchListItem): boolean {
  if (branch.deletedAt) {
    return false;
  }
  return branch.status === "ACTIVE";
}

/** BranchBatch assignments only (API `assignedBranchIds` includes legacy primary branchId). */
export function getBatchBranchAssignmentIds(batch: Batch): string[] {
  return batch.assignedBranchIds ?? [];
}

export function buildLiveBranchMap(
  branches: BranchListItem[],
): Map<string, BranchListItem> {
  const map = new Map<string, BranchListItem>();
  for (const branch of branches) {
    if (isLiveBranch(branch)) {
      map.set(branch.id, branch);
    }
  }
  return map;
}

export function expandCourseManageBatchRows(
  batches: Batch[],
  liveBranchById: Map<string, BranchListItem>,
): CourseManageBatchRow[] {
  const rows: CourseManageBatchRow[] = [];

  for (const batch of batches) {
    const assignmentIds = getBatchBranchAssignmentIds(batch);

    for (const branchId of assignmentIds) {
      const branch = liveBranchById.get(branchId);
      if (!branch) {
        continue;
      }

      rows.push({
        batch,
        branchId,
        branchName: branch.branchName,
        rowKey: `${batch.id}:${branchId}`,
      });
    }
  }

  return rows.sort((left, right) => {
    const nameCompare = left.batch.name.localeCompare(right.batch.name);
    if (nameCompare !== 0) {
      return nameCompare;
    }
    return left.branchName.localeCompare(right.branchName);
  });
}

export function formatCourseManageBatchSchedule(batch: Batch): {
  primary: string;
  secondary: string;
} {
  const timings = getBatchTimings(batch);

  if (timings.length === 1) {
    const timing = timings[0];
    return {
      primary: formatTimingDateRange(timing),
      secondary: formatTimingRange(timing),
    };
  }

  if (timings.length > 1) {
    return {
      primary: formatBatchTimingsSummary(batch),
      secondary: formatBatchTimingNames(batch) || "—",
    };
  }

  return {
    primary: formatBatchDateRange(batch.startDate, batch.endDate),
    secondary: formatBatchTiming(batch.startTime, batch.endTime),
  };
}

const TERMINAL_ENROLLMENT_STATUSES = new Set([
  "REJECTED",
  "CANCELLED",
  "DROPPED",
]);

export function countBranchBatchEnrollments(
  enrollments: Enrollment[],
  batchId: string,
  branchId: string,
): number {
  let count = 0;

  for (const enrollment of enrollments) {
    if (enrollment.isDeleted) {
      continue;
    }
    if (enrollment.batch.id !== batchId || enrollment.branch.id !== branchId) {
      continue;
    }
    if (TERMINAL_ENROLLMENT_STATUSES.has(enrollment.status)) {
      continue;
    }
    count += 1;
  }

  return count;
}

export function formatBranchBatchEnrollmentLabel(
  batch: Batch,
  branchId: string,
  enrollments: Enrollment[],
): string {
  const capacity = getBatchTotalCapacity(batch);
  if (capacity <= 0 && getBatchTimings(batch).length === 0) {
    const fallbackCapacity = batch.capacity ?? 0;
    if (fallbackCapacity <= 0) {
      return "—";
    }
    const enrolled = countBranchBatchEnrollments(
      enrollments,
      batch.id,
      branchId,
    );
    return `${enrolled} / ${fallbackCapacity}`;
  }

  const enrolled = countBranchBatchEnrollments(
    enrollments,
    batch.id,
    branchId,
  );
  return `${enrolled} / ${capacity}`;
}
