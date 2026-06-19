"use client";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

import {
  useBatch,
} from "@/src/features/batches";

import { BatchDetailsCard } from "@/src/features/batches/components/BatchDetailsCard";

interface BatchDetailsPageProps {
  id: string;
}

export function BatchDetailsPage({
  id,
}: BatchDetailsPageProps) {
  const {
    batch,
    isLoading,
    error,
  } = useBatch(id);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !batch) {
    return (
      <ErrorState
        title="Batch not found"
        description={
          error ??
          "Requested batch does not exist."
        }
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <BatchDetailsCard
        batch={batch}
      />
    </div>
  );
}