"use client";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

import { BatchCard } from "./BatchCard";

interface BatchGridProps {
  batches: Batch[];
  onView: (id: string) => void;
}

export function BatchGrid({
  batches,
  onView,
}: BatchGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {batches.map(
        (batch) => (
          <BatchCard
            key={batch.id}
            batch={batch}
            onView={onView}
          />
        ),
      )}
    </div>
  );
}