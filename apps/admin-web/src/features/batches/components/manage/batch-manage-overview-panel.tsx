"use client";

import { useMemo, type ReactNode } from "react";

import { Card } from "@/src/shared/components/ui/card";

import type {
  Batch,
  BatchCourseAssignment,
  BatchSummary,
} from "@/src/features/batches/types/batch.types";
import { formatBatchMode } from "@/src/features/batches/utils/batch.helper";
import {
  formatAssignedCourseTitles,
  formatAssignedTrainerNames,
  formatBatchCategoriesFromAssignments,
  formatDaysRemainingOrExpiredStatus,
  getUniqueCategoryNames,
  NO_BATCH_COURSES_LABEL,
} from "@/src/features/batches/utils/batch-course.utils";
import {
  calculateBatchProgress,
  formatBatchDaysLabel,
  formatBatchDurationLabel,
  formatBatchOverviewDate,
  formatBatchOverviewTiming,
} from "@/src/features/batches/utils/batch-progress.utils";

interface Props {
  batch: Batch;
  summary: BatchSummary | null;
  summaryLoading?: boolean;
  assignments: BatchCourseAssignment[];
  assignmentsLoading?: boolean;
}

function OverviewField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function emptyCourseValue(label: string) {
  return (
    <span className="font-normal text-slate-500">{label}</span>
  );
}

export function BatchManageOverviewPanel({
  batch,
  summary,
  summaryLoading = false,
  assignments,
  assignmentsLoading = false,
}: Props) {
  const progress = useMemo(() => calculateBatchProgress(batch), [batch]);

  const enrolledCount =
    summary?.studentsCount ?? summary?.enrolledCount ?? 0;
  const capacity = summary?.capacity ?? batch.capacity;

  const categoriesLabel = formatBatchCategoriesFromAssignments(assignments);
  const assignedCoursesLabel = formatAssignedCourseTitles(assignments);
  const assignedTrainersLabel = formatAssignedTrainerNames(assignments);
  const uniqueCategoryCount = getUniqueCategoryNames(assignments).length;
  const categoryLabel = uniqueCategoryCount > 1 ? "Categories" : "Category";

  const daysRemainingLabel = formatDaysRemainingOrExpiredStatus(
    progress.isExpired,
    progress.isNotStarted,
    progress.daysRemaining,
    progress.daysUntilStart,
  );

  return (
    <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Batch Information
      </h2>

      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <OverviewField label="Batch Name" value={batch.name} />
        <OverviewField label="Batch Code" value={batch.code} />
        <OverviewField
          label={categoryLabel}
          value={
            assignmentsLoading
              ? "…"
              : categoriesLabel === NO_BATCH_COURSES_LABEL
                ? emptyCourseValue(categoriesLabel)
                : categoriesLabel
          }
        />
        <OverviewField
          label="Start Date"
          value={formatBatchOverviewDate(batch.startDate)}
        />
        <OverviewField
          label="End Date"
          value={formatBatchOverviewDate(batch.endDate)}
        />
        <OverviewField
          label="Daily Timing"
          value={formatBatchOverviewTiming(batch.startTime, batch.endTime)}
        />
        <OverviewField
          label="Batch Days"
          value={formatBatchDaysLabel(batch.daysOfWeek)}
        />
        <OverviewField label="Batch Type" value={formatBatchMode(batch.mode)} />
        <OverviewField
          label="Duration"
          value={formatBatchDurationLabel(batch)}
        />
        <OverviewField
          label="Capacity"
          value={summaryLoading ? "…" : capacity}
        />
        <OverviewField
          label="Total Enrolled"
          value={summaryLoading ? "…" : enrolledCount}
        />
        <OverviewField
          label="Days Remaining / Expired Status"
          value={daysRemainingLabel}
        />
        <OverviewField
          label="Assigned Courses"
          value={
            assignmentsLoading
              ? "…"
              : assignedCoursesLabel === NO_BATCH_COURSES_LABEL
                ? emptyCourseValue(assignedCoursesLabel)
                : assignedCoursesLabel
          }
        />
        <OverviewField
          label="Assigned Trainers"
          value={
            assignmentsLoading
              ? "…"
              : assignedTrainersLabel === NO_BATCH_COURSES_LABEL
                ? emptyCourseValue(assignedTrainersLabel)
                : assignedTrainersLabel
          }
        />
        {batch.description?.trim() ? (
          <div className="sm:col-span-2">
            <OverviewField
              label="Description"
              value={batch.description.trim()}
            />
          </div>
        ) : null}
      </dl>
    </Card>
  );
}
