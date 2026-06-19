"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

export function EmptyBatch() {
  return (
    <EmptyState
      title="No Batches Found"
      description="There are no available batches at the moment."
    />
  );
}