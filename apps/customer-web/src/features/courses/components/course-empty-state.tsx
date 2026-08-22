"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

export function CourseEmptyState() {
  return (
    <EmptyState
      title="No Courses Found"
      description="Try a different search or category."
    />
  );
}
