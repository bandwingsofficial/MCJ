"use client";

import type { BranchSummaryCounts } from "@/src/features/branches/hooks/use-branch-summary";

interface Props {
  summary: BranchSummaryCounts | null;
  isLoading?: boolean;
}

const STATS: Array<{
  key: keyof Omit<BranchSummaryCounts, "branchId">;
  label: string;
}> = [
  { key: "students", label: "Students" },
  { key: "courses", label: "Courses" },
  { key: "batches", label: "Batches" },
  { key: "enrollments", label: "Enrollments" },
  { key: "instructors", label: "Instructors" },
  { key: "categories", label: "Categories" },
];

export function BranchOverviewSummary({
  summary,
  isLoading,
}: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      <div className="border-b border-slate-100 px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Summary
        </h2>
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.key} className="px-4 py-3">
            <p className="text-xs text-slate-500">
              {stat.label}
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
              {isLoading
                ? "—"
                : (summary?.[stat.key] ?? 0)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
