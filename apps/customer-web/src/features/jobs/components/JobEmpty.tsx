"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

export function JobEmpty() {
  return (
    <EmptyState
      title="No Jobs Found"
      description="There are currently no open job opportunities."
    />
  );
}