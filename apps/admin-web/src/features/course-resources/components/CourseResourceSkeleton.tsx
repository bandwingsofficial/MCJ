"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function CourseResourceSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border p-6"
        >
          <Skeleton className="mb-4 h-6 w-64" />

          <Skeleton className="mb-3 h-4 w-full" />

          <Skeleton className="mb-6 h-4 w-2/3" />

          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />

            <Skeleton className="h-8 w-20" />

            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}