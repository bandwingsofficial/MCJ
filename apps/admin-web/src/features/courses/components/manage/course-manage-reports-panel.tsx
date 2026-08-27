"use client";

import type { CourseSummary } from "@/src/features/courses/types/course.types";
import { Card } from "@/src/shared/components/ui/card";

interface Props {
  summary: CourseSummary | null;
  isLoading?: boolean;
}

const METRICS: Array<{
  key: keyof Omit<CourseSummary, "courseId">;
  label: string;
  description: string;
}> = [
  {
    key: "modules",
    label: "Modules",
    description: "Total modules in this course",
  },
  {
    key: "lessons",
    label: "Lessons",
    description: "Total lessons across all modules",
  },
  {
    key: "batches",
    label: "Batches",
    description: "Scheduled batches for this course",
  },
  {
    key: "students",
    label: "Students",
    description: "Students enrolled in this course",
  },
  {
    key: "instructors",
    label: "Instructors",
    description: "Trainers assigned to this course",
  },
  {
    key: "branches",
    label: "Branches",
    description: "Branches offering this course",
  },
  {
    key: "quizzes",
    label: "Quizzes",
    description: "Quizzes linked to this course",
  },
];

export function CourseManageReportsPanel({
  summary,
  isLoading,
}: Props) {
  return (
    <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[#102A56]">
          Course Metrics
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Current counts from the course summary API.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((metric) => (
          <div
            key={metric.key}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {metric.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[#102A56]">
              {isLoading ? "—" : (summary?.[metric.key] ?? 0)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {metric.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
