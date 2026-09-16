"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Batch } from "@/src/features/batches/types/batch.types";
import {
  buildBranchCourseBatchTabs,
  type BranchParentBatchRow,
} from "@/src/features/branches/utils/branch-batch.utils";
import { Button } from "@/src/shared/components/ui/button";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  branchName: string;
  batches: Batch[];
  courseSlugById: Map<string, string>;
  isLoading: boolean;
}

function TimingCell({ row }: { row: BranchParentBatchRow }) {
  return (
    <div className="space-y-3">
      {row.modeGroups.map((group) => (
        <div key={group.mode} className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
            {group.modeLabel}
          </p>
          {group.lines.map((line) => (
            <div key={`${group.mode}-${line.name}-${line.timeRange}`}>
              <p className="text-sm font-medium text-[#0B1F3A]">{line.name}</p>
              <p className="text-xs text-slate-500">{line.timeRange}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function DaysCell({ row }: { row: BranchParentBatchRow }) {
  const lines = row.modeGroups.flatMap((group) => group.lines);

  return (
    <div className="space-y-2">
      {lines.map((line) => (
        <p key={`${line.name}-${line.days}`} className="text-sm text-slate-600">
          {line.days}
        </p>
      ))}
    </div>
  );
}

export function BranchUpcomingBatchesSection({
  branchName,
  batches,
  courseSlugById,
  isLoading,
}: Props) {
  const courseTabs = useMemo(
    () => buildBranchCourseBatchTabs(batches, courseSlugById),
    [batches, courseSlugById],
  );

  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (courseTabs.length === 0) {
      setActiveCourseId(null);
      return;
    }

    setActiveCourseId((current) =>
      current && courseTabs.some((tab) => tab.courseId === current)
        ? current
        : courseTabs[0]?.courseId ?? null,
    );
  }, [courseTabs]);

  const activeTab = courseTabs.find((tab) => tab.courseId === activeCourseId);

  return (
    <section className="bg-[#F8FBFF] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
            Batches
          </p>
          <h2 className="text-2xl font-bold text-[#0B1F3A]">
            Current Batches at {branchName}
          </h2>
        </div>

        {isLoading ? (
          <Skeleton className="h-56 w-full rounded-2xl" />
        ) : courseTabs.length === 0 ? (
          <EmptyState
            title="No upcoming batches available"
            description="New upcoming batches will appear here when they are published for this branch."
          />
        ) : (
          <>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {courseTabs.map((tab) => (
                <button
                  key={tab.courseId}
                  type="button"
                  onClick={() => setActiveCourseId(tab.courseId)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                    activeCourseId === tab.courseId
                      ? "border-[#2563EB] bg-[#2563EB] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#2563EB]/30 hover:text-[#2563EB]",
                  )}
                >
                  {tab.courseTitle}
                </button>
              ))}
            </div>

            {activeTab && activeTab.rows.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Timing</th>
                      <th className="px-4 py-3">Days</th>
                      <th className="px-4 py-3">Start Date</th>
                      <th className="px-4 py-3">Availability</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab.rows.map((row) => (
                      <tr
                        key={row.batchId}
                        className="border-b border-slate-100 align-top last:border-0"
                      >
                        <td className="px-4 py-4 font-medium text-[#0B1F3A]">
                          {row.batchName}
                        </td>
                        <td className="px-4 py-4">
                          <TimingCell row={row} />
                        </td>
                        <td className="px-4 py-4">
                          <DaysCell row={row} />
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.startDateLabel}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                              row.availabilityTone === "success" &&
                                "bg-emerald-50 text-emerald-700",
                              row.availabilityTone === "warning" &&
                                "bg-amber-50 text-amber-700",
                              row.availabilityTone === "muted" &&
                                "bg-slate-100 text-slate-500",
                            )}
                          >
                            {row.availabilityLabel}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {row.joinHref ? (
                            <Link href={row.joinHref}>
                              <Button size="sm" className="rounded-lg bg-[#0B1F3A]">
                                Join Now
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400">Unavailable</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No upcoming batches available"
                description="This course does not have any upcoming batches at this branch right now."
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
