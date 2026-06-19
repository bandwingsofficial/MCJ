"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function BatchSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />

        <Skeleton className="h-10 w-36" />
      </div>

      <Card className="space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Skeleton className="h-10 w-full" />

          <Skeleton className="h-10 w-full" />

          <Skeleton className="h-10 w-full" />

          <Skeleton className="h-10 w-full" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="space-y-4 p-6">
          <Skeleton className="h-12 w-full" />

          {Array.from({
            length: 8,
          }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-16 w-full"
            />
          ))}
        </div>
      </Card>
    </div>
  );
}