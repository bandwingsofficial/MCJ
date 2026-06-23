"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function EnrollmentSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({
        length: 3,
      }).map((_, index) => (
        <Card
          key={index}
          className="space-y-6 p-6"
        >
          <Skeleton className="h-8 w-72" />

          <Skeleton className="h-5 w-40" />

          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>

          <Skeleton className="h-16 w-full" />

          <div className="flex justify-end">
            <Skeleton className="h-10 w-36" />
          </div>
        </Card>
      ))}
    </div>
  );
}