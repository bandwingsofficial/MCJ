"use client";

import type { BatchCourseAssignment } from "@/src/features/batches/types/batch.types";
import {
  COURSE_TRAINER_UNASSIGNED_LABEL,
  formatAssignmentSessionCourseLabel,
  formatAssignmentTrainerNames,
  getCourseCategoryName,
} from "@/src/features/batches/utils/batch-course.utils";

interface Props {
  assignments: BatchCourseAssignment[];
  isLoading?: boolean;
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="truncate text-xs text-slate-600">
      <span className="text-slate-500">{label}: </span>
      <span className="font-medium text-[#102A56]">{value}</span>
    </p>
  );
}

export function BatchAssignedCoursesGrid({
  assignments,
  isLoading = false,
}: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">Assigned Courses</p>
        <p className="mt-2 text-sm text-[#647A9B]">Loading assigned courses...</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
        <p className="text-sm font-medium text-[#102A56]">
          No courses assigned to this batch.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Assigned Courses</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {assignments.map((assignment) => {
          const trainerLabel =
            formatAssignmentTrainerNames(assignment) ||
            COURSE_TRAINER_UNASSIGNED_LABEL;
          const category = getCourseCategoryName(assignment) || "—";

          return (
            <article
              key={assignment.id}
              className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <h4 className="truncate text-sm font-semibold text-[#102A56]">
                {formatAssignmentSessionCourseLabel(assignment)}
              </h4>
              <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
                {assignment.course.code || "—"}
              </p>
              <div className="mt-2 space-y-1">
                <DetailLine label="Category" value={category} />
                <DetailLine label="Trainer" value={trainerLabel} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
