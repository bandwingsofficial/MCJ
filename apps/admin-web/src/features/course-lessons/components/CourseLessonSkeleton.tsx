"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function CourseLessonSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border p-5"
        >
          <Skeleton className="h-6 w-1/3" />

          <Skeleton className="mt-3 h-4 w-full" />

          <Skeleton className="mt-2 h-4 w-4/5" />

          <div className="mt-5 flex justify-between">
            <Skeleton className="h-5 w-24" />

            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}