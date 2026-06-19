"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function BatchSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="space-y-4 rounded-2xl border p-5"
        >
          <Skeleton className="h-6 w-1/2" />

          <Skeleton className="h-4 w-24" />

          <Skeleton className="h-4 w-full" />

          <Skeleton className="h-4 w-4/5" />

          <Skeleton className="h-4 w-2/3" />

          <Skeleton className="mt-5 h-10 w-full" />
        </div>
      ))}
    </div>
  );
}