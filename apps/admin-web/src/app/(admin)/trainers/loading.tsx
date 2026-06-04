import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonTable rows={10} />
    </div>
  );
}