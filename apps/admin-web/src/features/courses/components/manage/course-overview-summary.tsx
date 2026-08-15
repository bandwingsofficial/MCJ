"use client";

import type { CourseContentStats } from "@/src/features/courses/utils/course-content-stats.util";

interface Props {
  stats: CourseContentStats;
  isLoading?: boolean;
}

const STATS: Array<{
  key: keyof CourseContentStats;
  label: string;
}> = [
  { key: "modules", label: "Modules" },
  { key: "lessons", label: "Lessons" },
  { key: "selfPacedVideos", label: "Self-Paced Videos" },
  { key: "liveLessons", label: "Live Recorded Videos" },
  { key: "resources", label: "Resources" },
  { key: "quizzes", label: "Quizzes" },
  { key: "assignments", label: "Assignments" },
];

export function CourseOverviewSummary({
  stats,
  isLoading,
}: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      <div className="border-b border-slate-100 px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Content
        </h2>
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-3 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.key} className="px-4 py-3">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
              {isLoading ? "—" : stats[stat.key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
