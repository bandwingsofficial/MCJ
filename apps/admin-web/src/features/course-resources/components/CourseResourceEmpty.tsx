"use client";

import { Button } from "@/src/shared/components/ui/button";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

interface CourseResourceEmptyProps {
  onCreate?: () => void;
}

export function CourseResourceEmpty({
  onCreate,
}: CourseResourceEmptyProps) {
  return (
    <EmptyState
      title="No Resources Found"
      description="Create the first resource for this lesson."
      action={
        onCreate ? (
          <Button
            onClick={onCreate}
          >
            Add Resource
          </Button>
        ) : undefined
      }
    />
  );
}