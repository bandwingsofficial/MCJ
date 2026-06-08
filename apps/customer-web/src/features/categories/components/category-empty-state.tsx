// src/features/categories/components/category-empty-state.tsx

"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

export function CategoryEmptyState() {
  return (
    <EmptyState
      title="No Categories Found"
      description="Try a different search keyword."
    />
  );
}