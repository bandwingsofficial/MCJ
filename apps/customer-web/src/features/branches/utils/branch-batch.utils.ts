import type { Batch } from "@/src/features/batches/types/batch.types";
import {
  formatBatchDays,
  formatEnrollmentDate,
  formatEnrollmentTime,
  getBatchAvailableSeats,
  isBatchBlockedForSelection,
} from "@/src/features/enrollments/utils/enrollment-batch.utils";

export interface BranchBatchRow {
  id: string;
  batchId: string;
  courseTitle: string;
  courseSlug: string | null;
  batchName: string;
  modeLabel: string;
  timingLabel: string;
  daysLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  seatsLabel: string;
  availabilityLabel: string;
  availabilityTone: "success" | "warning" | "muted";
  joinHref: string | null;
}

function formatMode(mode: Batch["mode"]): string {
  return mode
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getAvailability(batch: Batch): {
  label: string;
  tone: BranchBatchRow["availabilityTone"];
} {
  if (isBatchBlockedForSelection(batch)) {
    return { label: "Closed", tone: "muted" };
  }

  const seats = getBatchAvailableSeats(batch);

  if (seats <= 0) {
    return { label: "Full", tone: "muted" };
  }

  if (seats <= 5) {
    return { label: "Few Seats Left", tone: "warning" };
  }

  return { label: "Seats Available", tone: "success" };
}

export function buildBranchBatchRows(batches: Batch[]): BranchBatchRow[] {
  return batches
    .filter((batch) => !batch.isDeleted && batch.courseId)
    .map((batch) => {
      const availability = getAvailability(batch);
      const modes = batch.timings?.length
        ? [...new Set(batch.timings.map((timing) => formatMode(timing.mode)))]
        : [formatMode(batch.mode)];

      const timingParts = batch.timings?.length
        ? batch.timings.map(
            (timing) =>
              `${formatMode(timing.mode)} · ${formatEnrollmentTime(timing.startTime)} – ${formatEnrollmentTime(timing.endTime)}`,
          )
        : [
            `${formatEnrollmentTime(batch.startTime)} – ${formatEnrollmentTime(batch.endTime)}`,
          ];

      const joinHref =
        batch.course?.id && !isBatchBlockedForSelection(batch) &&
        getBatchAvailableSeats(batch) > 0
          ? `/courses/${encodeURIComponent(batch.slug.split("/")[0] ?? batch.course.id)}/enroll?batchId=${batch.id}&branchId=${batch.branchId ?? ""}`
          : batch.courseId
            ? `/courses/${encodeURIComponent(batch.slug)}/enroll?batchId=${batch.id}&branchId=${batch.branchId ?? ""}`
            : null;

      return {
        id: batch.id,
        batchId: batch.id,
        courseTitle: batch.course?.title ?? "Course",
        courseSlug: batch.slug,
        batchName: batch.name,
        modeLabel: modes.join(" · "),
        timingLabel: timingParts.join(" | "),
        daysLabel: formatBatchDays(batch.daysOfWeek ?? []),
        startDateLabel: formatEnrollmentDate(batch.startDate),
        endDateLabel: formatEnrollmentDate(batch.endDate),
        seatsLabel: `${getBatchAvailableSeats(batch)} / ${batch.capacity}`,
        availabilityLabel: availability.label,
        availabilityTone: availability.tone,
        joinHref,
      };
    });
}
