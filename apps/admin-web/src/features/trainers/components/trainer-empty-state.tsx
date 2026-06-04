"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

export function TrainerEmptyState() {
  return (
    <EmptyState
      title="No Trainers Found"
      description="Create your first trainer to get started."
    />
  );
}