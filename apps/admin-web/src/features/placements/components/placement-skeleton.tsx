import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

export function PlacementSkeleton() {
  return (
    <SkeletonTable rows={8} />
  );
}