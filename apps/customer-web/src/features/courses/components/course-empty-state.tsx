"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

interface CourseEmptyStateProps {
  hasSearch?: boolean;
}

export function CourseEmptyState({ hasSearch = false }: CourseEmptyStateProps) {
  if (hasSearch) {
    return (
      <EmptyState
        title="No Courses Found"
        description="Try a different search to find matching courses."
      />
    );
  }

  return (
    <EmptyState
      title="No Courses Found"
      description="There are no courses available right now."
    />
  );
}
