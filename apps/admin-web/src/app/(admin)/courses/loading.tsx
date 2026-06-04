import { Skeleton } from "@/src/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-64" />

      <Skeleton className="h-12 w-full" />

      <Skeleton className="h-[600px] w-full" />
    </div>
  );
}