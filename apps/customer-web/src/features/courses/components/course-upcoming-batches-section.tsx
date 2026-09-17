"use client";

import { useMemo } from "react";

import { BatchTimingsTable } from "@/src/features/batches/components/batch-timings-table";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { buildCourseUpcomingBatchTableRows } from "@/src/features/courses/utils/course-batch.utils";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

interface CourseUpcomingBatchesSectionProps {
  batches: Batch[];
  courseSlug: string;
  courseId: string;
  isLoading?: boolean;
}

export function CourseUpcomingBatchesSection({
  batches,
  courseSlug,
  courseId,
  isLoading = false,
}: CourseUpcomingBatchesSectionProps) {
  const rows = useMemo(
    () => buildCourseUpcomingBatchTableRows(batches),
    [batches],
  );

  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No upcoming batches available"
        description="New upcoming batches will appear here when they are published for this course."
      />
    );
  }

  return (
    <BatchTimingsTable
      rows={rows}
      courseSlug={courseSlug}
      courseId={courseId}
    />
  );
}
