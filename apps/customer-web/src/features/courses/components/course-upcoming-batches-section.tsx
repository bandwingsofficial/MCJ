"use client";

import { useMemo } from "react";

import { CourseBatchTimingsModeTable } from "@/src/features/courses/components/course-batch-timings-mode-table";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { buildCourseModeGroupedBatchBlocks } from "@/src/features/courses/utils/course-batch.utils";
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
  isLoading = false,
}: CourseUpcomingBatchesSectionProps) {
  const blocks = useMemo(
    () => buildCourseModeGroupedBatchBlocks(batches),
    [batches],
  );

  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  if (blocks.length === 0) {
    return (
      <EmptyState
        title="No upcoming batches available"
        description="New upcoming batches will appear here when they are published for this course."
      />
    );
  }

  return <CourseBatchTimingsModeTable blocks={blocks} />;
}
