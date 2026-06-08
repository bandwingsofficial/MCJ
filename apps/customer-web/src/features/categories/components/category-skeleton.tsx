// src/features/categories/components/category-skeleton.tsx

"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

interface CategorySkeletonProps {
  count?: number;
}

export function CategorySkeleton({
  count = 6,
}: CategorySkeletonProps) {
  return (
    <div
      className="
        grid
        gap-4
        sm:grid-cols-2
        lg:grid-cols-3
      "
    >
      {Array.from({
        length: count,
      }).map((_, index) => (
        <div
          key={index}
          className="
            rounded-lg
            border
            p-4
            space-y-3
          "
        >
          <Skeleton className="h-6 w-2/3" />

          <Skeleton className="h-4 w-full" />

          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}