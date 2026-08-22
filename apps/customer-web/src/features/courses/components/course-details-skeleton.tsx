"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function CourseDetailsSkeleton() {
  return (
    <main className="w-full bg-white">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6">
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-5 pb-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[7fr_3fr] lg:gap-8">
            <div className="min-w-0">
              <Skeleton className="h-[220px] w-full rounded-xl sm:h-[260px] lg:h-[300px]" />
              <Skeleton className="mt-5 h-6 w-28 rounded-full" />
              <Skeleton className="mt-3 h-8 w-full max-w-lg" />
              <Skeleton className="mt-2 h-4 w-full max-w-md" />
              <Skeleton className="mt-2 h-4 w-20" />
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[7fr_3fr] lg:gap-8">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 px-5 py-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="mt-1 h-3 w-28" />
              </div>
              <div className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 px-5 py-3">
                <div className="flex gap-6">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-10" />
                </div>
              </div>
              <div className="p-5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
        </div>
      </section>
    </main>
  );
}
