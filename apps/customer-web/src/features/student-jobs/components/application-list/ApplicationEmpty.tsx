"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

export function ApplicationEmpty() {
  return (
    <EmptyState
      title="No Applications Found"
      description="You haven't applied for any jobs yet."
    />
  );
}