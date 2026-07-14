"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function StudentProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-72" />

      <Card className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />

        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({
            length: 12,
          }).map((_, index) => (
            <div
              key={index}
              className="space-y-2"
            >
              <Skeleton className="h-4 w-24" />

              <Skeleton className="h-11 w-full" />
            </div>
          ))}
        </div>

        <Skeleton className="h-12 w-36" />
      </Card>
    </div>
  );
}