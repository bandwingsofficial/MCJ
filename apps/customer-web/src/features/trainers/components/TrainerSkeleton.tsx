"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

interface TrainerSkeletonProps {
  count?: number;
}

export function TrainerSkeleton({
  count = 8,
}: TrainerSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({
        length: count,
      }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden"
        >
          <Skeleton className="h-64 w-full" />

          <div className="space-y-4 p-5">
            <Skeleton className="h-6 w-2/3" />

            <Skeleton className="h-4 w-1/2" />

            <Skeleton className="h-4 w-full" />

            <Skeleton className="h-4 w-5/6" />

            <Skeleton className="h-4 w-2/3" />

            <div className="flex justify-between pt-2">
              <Skeleton className="h-5 w-16" />

              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}