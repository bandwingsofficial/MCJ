"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

export function PlacementEmpty() {
  return (
    <EmptyState
      title="No Placement Found"
      description="Your placement information will appear here once you have been placed."
    />
  );
}