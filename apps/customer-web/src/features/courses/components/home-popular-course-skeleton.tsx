"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

interface HomePopularCourseSkeletonProps {
  count?: number;
}

export function HomePopularCourseSkeleton({
  count = 5,
}: HomePopularCourseSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
        >
          <Skeleton className="aspect-video w-full shrink-0 rounded-none" />
          <div className="flex flex-1 flex-col p-3">
            <div className="mb-1.5 flex gap-1">
              <Skeleton className="h-4 w-14 rounded-sm" />
              <Skeleton className="h-4 w-12 rounded-sm" />
            </div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-1 h-3.5 w-full" />
            <Skeleton className="mt-1 h-3 w-full" />
            <div className="mt-2 flex gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2">
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-1">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-7 w-[4.5rem]" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
