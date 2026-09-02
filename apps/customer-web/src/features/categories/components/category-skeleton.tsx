"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

interface CategorySkeletonProps {
  count?: number;
}

export function CategorySkeleton({ count = 6 }: CategorySkeletonProps) {
  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,32,68,0.04)]"
        >
          <Skeleton className="h-28 w-full shrink-0 rounded-none" />

          <div className="flex flex-1 flex-col p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-2 h-3.5 w-full" />
            <Skeleton className="mt-1 h-3.5 w-4/5" />

            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
