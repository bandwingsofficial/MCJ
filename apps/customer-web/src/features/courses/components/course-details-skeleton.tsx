"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function CourseDetailsSkeleton() {
  return (
    <main className="w-full bg-white">
      <div className="border-b border-slate-100 bg-[#F7FAFF]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </div>

      <section className="bg-[linear-gradient(180deg,#EEF4FF_0%,#F8FBFF_42%,#FFFFFF_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-5 h-10 w-full max-w-md" />
              <Skeleton className="mt-4 h-5 w-full max-w-lg" />
              <Skeleton className="mt-2 h-4 w-4/5 max-w-md" />
              <Skeleton className="mt-5 h-4 w-56" />
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index}>
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="mt-2.5 h-4 w-20" />
                    <Skeleton className="mt-1 h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>
            <Skeleton className="aspect-[4/3] w-full rounded-[1.5rem] sm:aspect-[5/4]" />
          </div>
        </div>
      </section>

      <div className="border-y border-slate-200">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-24 shrink-0 rounded-lg" />
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="mt-8 h-40 w-full rounded-xl" />
        </div>
      </section>
    </main>
  );
}
