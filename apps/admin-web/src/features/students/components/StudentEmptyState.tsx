"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

export function StudentEmptyState() {
  return (
    <EmptyState
      title="No Students Found"
      description="Students will appear here after they are created."
    />
  );
}