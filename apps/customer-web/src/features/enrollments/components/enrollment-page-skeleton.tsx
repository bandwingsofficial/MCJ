import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function EnrollmentPageSkeleton() {
  return (
    <main className="min-h-screen w-full bg-white">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-80 max-w-full" />
          <Skeleton className="h-4 w-[32rem] max-w-full" />
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
          <div className="space-y-6">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
