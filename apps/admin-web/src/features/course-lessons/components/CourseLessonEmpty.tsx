"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

export function CourseLessonEmpty() {
  return (
    <EmptyState
      title="No Course Lessons Found"
      description="Create your first lesson to begin building this module."
    />
  );
}