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

const ALL_COURSES = "all";

interface Props {
  branchName: string;
  branchId: string;
  batches: Batch[];
  courseSlugById: Map<string, string>;
  isLoading: boolean;
}

function buildBranchCourseTabs(batches: Batch[]) {
  const tabs = new Map<string, { courseId: string; courseTitle: string }>();

  batches.filter(isUpcomingBatch).forEach((batch) => {
    if (!batch.courseId || tabs.has(batch.courseId)) {
      return;
    }

    tabs.set(batch.courseId, {
      courseId: batch.courseId,
      courseTitle: batch.course?.title?.trim() || "Course",
    });
  });

  return Array.from(tabs.values()).sort((left, right) =>
    left.courseTitle.localeCompare(right.courseTitle),
  );
}

export function BranchUpcomingBatchesSection({
  branchName,
  branchId,
  batches,
  courseSlugById,
  isLoading,
}: Props) {
  const courseTabs = useMemo(
    () => buildBranchCourseTabs(batches),
    [batches],
  );

  const [selectedCourseId, setSelectedCourseId] = useState(ALL_COURSES);

  useEffect(() => {
    if (courseTabs.length === 0) {
      setSelectedCourseId(ALL_COURSES);
      return;
    }

    setSelectedCourseId((current) => {
      if (current === ALL_COURSES) {
        return ALL_COURSES;
      }

      return courseTabs.some((tab) => tab.courseId === current)
        ? current
        : ALL_COURSES;
    });
  }, [courseTabs]);

  const filteredBatches = useMemo(() => {
    const upcoming = batches.filter(isUpcomingBatch);

    if (selectedCourseId === ALL_COURSES) {
      return upcoming;
    }

    return upcoming.filter((batch) => batch.courseId === selectedCourseId);
  }, [batches, selectedCourseId]);

  const tableRows = useMemo(() => {
    return buildCourseUpcomingBatchTableRows(filteredBatches).map((row) => ({
      ...row,
      branchId,
      courseSlug: courseSlugById.get(row.courseId) ?? null,
    }));
  }, [branchId, courseSlugById, filteredBatches]);

  const activeCourseSlug =
    selectedCourseId === ALL_COURSES
      ? null
      : courseSlugById.get(selectedCourseId) ?? null;

  const activeCourseId =
    selectedCourseId === ALL_COURSES ? "" : selectedCourseId;

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
            title="No batches or courses available"
            description="No batches are assigned to this branch yet. Assigned courses and batches will appear here when published."
          />
        ) : (
          <>
            <div className="mb-5 border-b border-slate-200/80">
              <div
                role="tablist"
                aria-label="Filter batches by course"
                className="flex min-w-0 items-center gap-1 overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedCourseId === ALL_COURSES}
                  onClick={() => setSelectedCourseId(ALL_COURSES)}
                  className={cn(
                    "relative inline-flex shrink-0 items-center px-3.5 py-3 text-sm font-medium transition-colors",
                    selectedCourseId === ALL_COURSES
                      ? "bg-[#EAF1FF] text-[#2563D9]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#0B1F3A]",
                  )}
                >
                  All Courses
                  {selectedCourseId === ALL_COURSES ? (
                    <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-[#2563D9]" />
                  ) : null}
                </button>

                {courseTabs.map((tab) => {
                  const active = selectedCourseId === tab.courseId;

                  return (
                    <button
                      key={tab.courseId}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedCourseId(tab.courseId)}
                      className={cn(
                        "relative inline-flex shrink-0 items-center px-3.5 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-[#EAF1FF] text-[#2563D9]"
                          : "text-slate-500 hover:bg-slate-50 hover:text-[#0B1F3A]",
                      )}
                    >
                      {tab.courseTitle}
                      {active ? (
                        <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-[#2563D9]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {tableRows.length > 0 ? (
              <BatchTimingsTable
                rows={tableRows}
                courseSlug={activeCourseSlug}
                courseId={activeCourseId}
              />
            ) : (
              <EmptyState
                title="No batches available"
                description="This course does not have any upcoming batches at this branch right now."
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
