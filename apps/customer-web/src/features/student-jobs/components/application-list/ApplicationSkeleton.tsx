"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function ApplicationSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-48 w-full rounded-lg"
        />
      ))}
    </div>
  );
}