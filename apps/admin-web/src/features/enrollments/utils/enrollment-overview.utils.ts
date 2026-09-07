import type { BatchDurationType, DayOfWeek } from "@/src/features/batches/types/batch.types";
import { formatBatchDuration } from "@/src/features/batches/utils/batch-duration.utils";
import { formatBatchTiming } from "@/src/features/batches/utils/batch.helper";
import {
  getBatchModeLabel,
  isBatchMode,
} from "@/src/features/batches/utils/batch-mode.utils";
import { formatTimingDays } from "@/src/features/batches/utils/batch-timing.utils";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
import type {
  BatchTimingInfo,
  Enrollment,
} from "@/src/features/enrollments/types/enrollment.types";
import { formatEnrollmentOverviewDate } from "@/src/features/enrollments/utils/create-enrollment-selection.utils";
import { formatEnrollmentFinalAmount } from "@/src/features/students/utils/enrollment-display.utils";

import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

export function getEnrollmentTimingEnrolledCount(
  timing: BatchTimingInfo,
): number {
  return Math.max(0, timing.enrolledCount ?? 0);
}

export function getEnrollmentTimingAvailableSeats(
  timing: BatchTimingInfo,
): number {
  return Math.max(
    0,
    timing.capacity - getEnrollmentTimingEnrolledCount(timing),
  );
}

export function formatEnrollmentOverviewContextLabel(
  enrollment: Enrollment,
): string {
  const mode = formatEnrollmentOverviewSelectedMode(enrollment);
  const timing = enrollment.batchTiming?.name;

  if (mode !== "—" && timing) {
    return `${mode} · ${timing}`;
  }

  if (timing) {
    return timing;
  }

  if (mode !== "—") {
    return mode;
  }

  return enrollment.batch?.name ?? enrollment.enrollmentNumber;
}

function displayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export function formatEnrollmentOverviewStudentName(
  enrollment: Enrollment,
): string {
  return displayValue(
    formatPersonName(
      enrollment.student?.firstName,
      enrollment.student?.lastName,
    ),
  );
}

export function formatEnrollmentOverviewStudentId(
  enrollment: Enrollment,
): string {
  return displayValue(enrollment.student?.studentCode);
}

export function formatEnrollmentOverviewBranchName(
  enrollment: Enrollment,
): string {
  return displayValue(enrollment.branch?.branchName);
}

export function formatEnrollmentOverviewBatchName(
  enrollment: Enrollment,
): string {
  return displayValue(enrollment.batch?.name);
}

export function formatEnrollmentOverviewBatchNumber(
  enrollment: Enrollment,
): string {
  return displayValue(enrollment.batch?.code);
}

export function formatEnrollmentOverviewCourseTitle(
  enrollment: Enrollment,
): string {
  return displayValue(enrollment.course?.title);
}

export function formatEnrollmentOverviewCategoryName(
  enrollment: Enrollment,
): string {
  return displayValue(enrollment.category?.name);
}

/** Trainer comes from Enrollment → Batch → Course → Trainer (course relation). */
export function formatEnrollmentOverviewTrainerNames(
  enrollment: Enrollment,
): string {
  const trainers = enrollment.course?.trainers ?? [];

  if (!trainers.length) {
    return "—";
  }

  return trainers
    .map((trainer) =>
      [trainer.firstName, trainer.lastName].filter(Boolean).join(" "),
    )
    .filter(Boolean)
    .join(", ");
}

export function formatEnrollmentOverviewSelectedMode(
  enrollment: Enrollment,
): string {
  const mode = enrollment.batchTiming?.mode;

  if (!mode || !isBatchMode(mode)) {
    return "—";
  }

  return getBatchModeLabel(mode);
}

function formatOverviewTimingSchedule(timing: BatchTimingInfo): string {
  const days = formatTimingDays(timing.daysOfWeek as DayOfWeek[]);
  const range = formatBatchTiming(timing.startTime, timing.endTime);

  if (days === "—" && range === "—") {
    return "—";
  }

  if (days === "—") {
    return range;
  }

  if (range === "—") {
    return days;
  }

  return `${days} · ${range}`;
}

export function formatEnrollmentOverviewSelectedBatchTiming(
  enrollment: Enrollment,
): string {
  const timing = enrollment.batchTiming;

  if (!timing) {
    return "—";
  }

  const schedule = formatOverviewTimingSchedule(timing);

  if (schedule === "—") {
    return timing.name;
  }

  return `${timing.name} · ${schedule}`;
}

export function formatEnrollmentOverviewStartDate(
  enrollment: Enrollment,
): string {
  const value =
    enrollment.batchTiming?.startDate ?? enrollment.joiningDate ?? null;

  return value ? formatEnrollmentOverviewDate(value) : "—";
}

export function formatEnrollmentOverviewEndDate(
  enrollment: Enrollment,
): string {
  const value =
    enrollment.batchTiming?.endDate ?? enrollment.expectedCompletionDate ?? null;

  return value ? formatEnrollmentOverviewDate(value) : "—";
}

export function formatEnrollmentOverviewDuration(
  enrollment: Enrollment,
): string {
  const batchDuration = formatBatchDuration({
    durationValue: enrollment.batch?.durationValue ?? null,
    durationType:
      (enrollment.batch?.durationType as BatchDurationType | null) ?? null,
  });

  if (batchDuration !== "—") {
    return batchDuration;
  }

  if (
    enrollment.course?.duration &&
    enrollment.course?.durationType &&
    Number(enrollment.course.duration) > 0
  ) {
    return formatBatchDuration({
      durationValue: enrollment.course.duration,
      durationType: enrollment.course.durationType as BatchDurationType,
    });
  }

  return "—";
}

export function formatEnrollmentOverviewEnrollmentDate(
  enrollment: Enrollment,
): string {
  const value = enrollment.admissionDate ?? enrollment.createdAt;
  return value ? formatStudentDate(value) : "—";
}

export function formatEnrollmentOverviewTotalFee(
  enrollment: Enrollment,
): number {
  return formatEnrollmentFinalAmount(enrollment);
}
