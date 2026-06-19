"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

export function EmptyBatch() {
  return (
    <EmptyState
      title="No Batches Found"
      description="Create your first batch."
    />
  );
}