"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function CourseDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="space-y-6">

        <Skeleton className="h-72 w-full rounded-xl" />

        <Skeleton className="h-10 w-1/2" />

        <Skeleton className="h-6 w-1/3" />

        <Skeleton className="h-32 w-full" />

      </div>
    </div>
  );
}