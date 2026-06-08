"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

interface CourseSkeletonProps {
  count?: number;
}

export function CourseSkeleton({
  count = 6,
}: CourseSkeletonProps) {
  return (
    <div
      className="
        grid
        gap-6
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {Array.from({
        length: count,
      }).map((_, index) => (
        <div
          key={index}
          className="
            rounded-lg
            border
            p-4
            space-y-4
          "
        >
          <Skeleton className="h-48 w-full" />

          <Skeleton className="h-6 w-2/3" />

          <Skeleton className="h-4 w-full" />

          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}