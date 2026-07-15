import {
  Card,
} from "@/src/shared/components/ui/card";
import {
  Skeleton,
} from "@/src/shared/components/ui/skeleton";

export function CourseSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <Skeleton className="h-8 w-72" />

        <Skeleton className="h-4 w-full" />

        <Skeleton className="h-4 w-2/3" />

        <div className="flex gap-3">
          <Skeleton className="h-8 w-24 rounded-full" />

          <Skeleton className="h-8 w-24 rounded-full" />

          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="space-y-4 p-4 lg:col-span-4">
          <Skeleton className="h-7 w-40" />

          {Array.from({
            length: 5,
          }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-16 w-full rounded-lg"
            />
          ))}
        </Card>

        <Card className="space-y-5 p-5 lg:col-span-8">
          <Skeleton className="aspect-video w-full rounded-xl" />

          <Skeleton className="h-8 w-80" />

          <Skeleton className="h-4 w-full" />

          <Skeleton className="h-4 w-5/6" />

          <Skeleton className="h-4 w-4/6" />

          <div className="space-y-3">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-12 w-full rounded-lg"
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}