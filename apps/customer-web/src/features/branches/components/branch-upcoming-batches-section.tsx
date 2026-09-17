"use client";

import { useEffect, useMemo, useState } from "react";

import { BatchTimingsTable } from "@/src/features/batches/components/batch-timings-table";
import type { Batch } from "@/src/features/batches/types/batch.types";
import {
  buildCourseUpcomingBatchTableRows,
  isUpcomingBatch,
} from "@/src/features/courses/utils/course-batch.utils";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  branchName: string;
  batches: Batch[];
  courseSlugById: Map<string, string>;
  isLoading: boolean;
}

function buildBranchCourseTabs(batches: Batch[]) {
  const tabs = new Map<
    string,
    { courseId: string; courseTitle: string; courseSlug: string | null }
  >();

  batches.filter(isUpcomingBatch).forEach((batch) => {
    if (!batch.courseId) {
      return;
    }

    if (tabs.has(batch.courseId)) {
      return;
    }

    tabs.set(batch.courseId, {
      courseId: batch.courseId,
      courseTitle: batch.course?.title ?? "Course",
      courseSlug: null,
    });
  });

  return Array.from(tabs.values()).sort((left, right) =>
    left.courseTitle.localeCompare(right.courseTitle),
  );
}

export function BranchUpcomingBatchesSection({
  branchName,
  batches,
  courseSlugById,
  isLoading,
}: Props) {
  const courseTabs = useMemo(() => {
    const tabs = buildBranchCourseTabs(batches);

    return tabs.map((tab) => ({
      ...tab,
      courseSlug: courseSlugById.get(tab.courseId) ?? null,
    }));
  }, [batches, courseSlugById]);

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

  const tableRows = useMemo(() => {
    if (!activeCourseId) {
      return [];
    }

    const courseBatches = batches.filter(
      (batch) => batch.courseId === activeCourseId && isUpcomingBatch(batch),
    );

    return buildCourseUpcomingBatchTableRows(courseBatches);
  }, [activeCourseId, batches]);

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
            {courseTabs.length > 1 ? (
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
            ) : null}

            {activeTab && tableRows.length > 0 ? (
              <BatchTimingsTable
                rows={tableRows}
                courseSlug={activeTab.courseSlug}
                courseId={activeTab.courseId}
              />
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
