"use client";

import { Card } from "@/src/shared/components/ui/card";

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

export function BranchStatCards({
  summary,
  isLoading,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {STATS.map((stat) => (
        <Card
          key={stat.key}
          className="rounded-xl border border-slate-200 p-3.5 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {stat.label}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {isLoading
              ? "—"
              : (summary?.[stat.key] ?? 0)}
          </p>
        </Card>
      ))}
    </div>
  );
}
