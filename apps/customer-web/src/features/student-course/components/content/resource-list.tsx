import { FileText } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Separator } from "@/src/shared/components/ui/separator";

import { ResourceCard } from "@/src/features/student-course/components/content/ResourceCard";

import type {
  LessonResource,
} from "@/src/features/student-course/types/resource.types";

interface ResourceListProps {
  resources: LessonResource[];
}

export function ResourceList({
  resources,
}: ResourceListProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />

          <div>
            <h2 className="text-lg font-semibold">
              Learning Resources
            </h2>

            <p className="text-sm text-muted-foreground">
              Download notes, PDFs and supporting files.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {resources.length} Resources
        </span>
      </div>

      <Separator />

      {resources.length === 0 ? (
        <EmptyState
          title="No Resources Available"
          description="There are no downloadable resources for this lesson."
        />
      ) : (
        <div className="space-y-4">
          {resources.map(
            (resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
              />
            ),
          )}
        </div>
      )}
    </Card>
  );
}