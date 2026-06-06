import { Skeleton } from "@/src/shared/components/ui/skeleton";

interface SkeletonTableProps {
  rows?: number;
}

export function SkeletonTable({
  rows = 10,
}: SkeletonTableProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map(
        (_, index) => (
          <Skeleton
            key={index}
            className="h-14 w-full"
          />
        )
      )}
    </div>
  );
}