"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Loader } from "@/src/shared/components/ui/loader";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function StudentPortalLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <Card className="p-8">
        <div className="flex items-center gap-4">
          <Loader />

          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-64" />

            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <Card
            key={index}
            className="space-y-4 p-6"
          >
            <Skeleton className="h-5 w-36" />

            <Skeleton className="h-10 w-full" />

            <Skeleton className="h-4 w-3/4" />

            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
      </div>

      <Card className="space-y-5 p-6">
        <Skeleton className="h-6 w-48" />

        <Skeleton className="h-4 w-full" />

        <Skeleton className="h-4 w-5/6" />

        <Skeleton className="h-4 w-2/3" />
      </Card>
    </div>
  );
}