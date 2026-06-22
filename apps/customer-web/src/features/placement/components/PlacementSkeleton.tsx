"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function PlacementSkeleton() {
  return (
    <Card className="space-y-6 p-6">
      <Skeleton className="h-8 w-60" />

      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-2/3" />

      <Skeleton className="h-px w-full" />

      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-1/2" />

      <Skeleton className="h-px w-full" />

      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-6 w-2/3" />
    </Card>
  );
}