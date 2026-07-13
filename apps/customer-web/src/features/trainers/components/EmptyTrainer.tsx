"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

interface EmptyTrainerProps {
  title?: string;
  description?: string;
}

export function EmptyTrainer({
  title = "No Trainers Found",
  description = "There are no trainers available at the moment.",
}: EmptyTrainerProps) {
  return (
    <EmptyState
      title={title}
      description={description}
    />
  );
}