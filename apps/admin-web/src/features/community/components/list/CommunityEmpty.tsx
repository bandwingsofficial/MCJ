"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

interface CommunityEmptyProps {
  title?: string;

  description?: string;
}

export function CommunityEmpty({
  title = "No Community Posts",
  description = "Create your first community post.",
}: CommunityEmptyProps) {
  return (
    <EmptyState
      title={title}
      description={description}
    />
  );
}