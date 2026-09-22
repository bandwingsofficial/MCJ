import type { Batch, BatchMode, BatchTiming } from "@/src/features/batches/types/batch.types";
import { batchService } from "@/src/features/batches/services/batch.service";
import {
  getConfiguredBatchModes,
  getBatchModeLabel,
  getTimingsForMode,
} from "@/src/features/batches/utils/batch-mode.utils";
import {
  formatTimingDays,
  formatTimingRange,
} from "@/src/features/batches/utils/batch-timing.utils";
import { branchService } from "@/src/features/branches/services/branch.service";
import type {
  BranchTrainerAssignment,
  BranchTrainerAssignmentType,
} from "@/src/features/branches/types/branch.types";
import { loadBranchAssignedCourses } from "@/src/features/branches/utils/branch-course-relation.utils";

export async function loadBranchTrainerAssignments(
  branchId: string,
): Promise<BranchTrainerAssignment[]> {
  if (!branchId) {
    return [];
  }

  const response = await branchService.getTrainerAssignments(branchId);
  return response.data?.items ?? [];
}

export function formatTrainerDisplayName(
  trainer: Pick<
    { firstName?: string | null; lastName?: string | null },
    "firstName" | "lastName"
  >,
): string {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ").trim();
}

export function getBranchOnlyAssignedTrainerIds(
  assignments: BranchTrainerAssignment[],
): string[] {
  return assignments
    .filter((row) => row.assignmentType === "BRANCH_ONLY")
    .map((row) => row.trainerId);
}

export function getAssignmentTypeLabel(
  assignmentType: BranchTrainerAssignmentType,
): string {
  return assignmentType === "BRANCH_ONLY" ? "Branch Only" : "Course / Batch";
}

export function formatBranchTrainerTimingLabel(
  timing: BranchTrainerAssignment["batchTiming"],
): string {
  if (!timing) {
    return "";
  }

  const asTiming = {
    startTime: timing.startTime,
    endTime: timing.endTime,
    daysOfWeek: [] as BatchTiming["daysOfWeek"],
  } as BatchTiming;

  const schedule = formatTimingRange(asTiming);
  return `${timing.name} · ${schedule}`;
}

export function filterBranchTrainerAssignments(
  assignments: BranchTrainerAssignment[],
  search: string,
): BranchTrainerAssignment[] {
  const query = search.trim().toLowerCase();

  if (!query) {
    return assignments;
  }

  return assignments.filter((row) => {
    const haystack = [
      formatTrainerDisplayName(row.trainer),
      row.trainer.employeeCode ?? "",
      row.trainer.qualification ?? "",
      row.trainer.specialization ?? "",
      row.course?.title ?? "",
      row.course?.code ?? "",
      row.batch?.name ?? "",
      row.batch?.code ?? "",
      row.mode ? getBatchModeLabel(row.mode as BatchMode) : "",
      row.batchTiming?.name ?? "",
      getAssignmentTypeLabel(row.assignmentType),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export async function loadUpcomingBranchCourseBatches(
  branchId: string,
  courseId: string,
): Promise<Batch[]> {
  const response = await batchService.getBatches({
    branchId,
    courseId,
    batchStatus: "UPCOMING",
    includeDeleted: false,
    isDeleted: false,
    page: 1,
    pageSize: 100,
  });

  return (response.data.items ?? []).filter(
    (batch) =>
      !batch.isDeleted &&
      !batch.deletedAt &&
      batch.status === "UPCOMING",
  );
}

export async function loadBatchForTrainerAssignment(
  batchId: string,
): Promise<Batch | null> {
  try {
    const response = await batchService.getBatch(batchId);
    return response.data ?? null;
  } catch {
    return null;
  }
}

export function getUpcomingTimingsForMode(
  batch: Batch | null,
  mode: BatchMode,
): BatchTiming[] {
  return getTimingsForMode(batch, mode).filter(
    (timing) =>
      !timing.isDeleted && timing.isActive && timing.status === "UPCOMING",
  );
}

export function getUpcomingConfiguredModes(batch: Batch | null): BatchMode[] {
  const modes = getConfiguredBatchModes(batch);
  return modes.filter((mode) => getUpcomingTimingsForMode(batch, mode).length > 0);
}

export async function loadBranchCoursesForTrainerAssign(branchId: string) {
  const { courses } = await loadBranchAssignedCourses(branchId);
  return courses.filter((course) => course.status === "ACTIVE");
}

export function formatTimingOptionLabel(timing: BatchTiming): string {
  const days = formatTimingDays(timing.daysOfWeek);
  const range = formatTimingRange(timing);
  return days ? `${timing.name} · ${days} · ${range}` : `${timing.name} · ${range}`;
}
