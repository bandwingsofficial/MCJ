"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { Card } from "@/src/shared/components/ui/card";

interface CourseModuleSkeletonProps {
  rows?: number;
}

export function CourseModuleSkeleton({
  rows = 6,
}: CourseModuleSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({
        length: rows,
      }).map((_, index) => (
        <Card
          key={index}
          className="p-5"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-64" />

              <Skeleton className="h-4 w-full" />

              <Skeleton className="h-4 w-3/4" />

              <div className="flex gap-2 pt-2">
                <Skeleton className="h-7 w-20 rounded-full" />

                <Skeleton className="h-7 w-24 rounded-full" />

                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
            </div>

            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  );
}