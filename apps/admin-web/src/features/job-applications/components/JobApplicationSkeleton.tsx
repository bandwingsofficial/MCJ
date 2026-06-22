import {
  Skeleton,
} from "@/src/shared/components/ui/skeleton";

export function JobApplicationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({
        length: 8,
      }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-6 gap-4 rounded-lg border p-4"
        >
          <Skeleton className="h-5 w-full" />

          <Skeleton className="h-5 w-full" />

          <Skeleton className="h-5 w-full" />

          <Skeleton className="h-5 w-full" />

          <Skeleton className="h-5 w-full" />

          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  );
}