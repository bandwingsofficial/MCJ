"use client";

import { useRouter } from "next/navigation";

import { PageHeader } from "@/src/shared/components/ui/page-header";
import { ErrorState } from "@/src/shared/components/ui/error-state";

import {
  useBatches,
} from "@/src/features/batches";

import { BatchGrid } from "@/src/features/batches/components/BatchGrid";
import { BatchSkeleton } from "@/src/features/batches/components/BatchSkeleton";
import { EmptyBatch } from "@/src/features/batches/components/EmptyBatch";

export function BatchPage() {
  const router = useRouter();

  const {
    batches,
    isLoading,
    error,
    refetch,
  } = useBatches();

  if (isLoading) {
    return <BatchSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load batches"
        description={error}
        onRetry={refetch}
      />
    );
  }

  if (batches.length === 0) {
    return <EmptyBatch />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 p-4">
      <PageHeader
        title="Available Batches"
        description="Choose a batch and begin your learning journey."
      />

      <BatchGrid
        batches={batches}
        onView={(id) =>
          router.push(`/batch/${id}`)
        }
      />
    </div>
  );
}