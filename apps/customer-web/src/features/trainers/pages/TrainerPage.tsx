"use client";

import { EmptyTrainer } from "@/src/features/trainers/components/EmptyTrainer";
import { TrainerGrid } from "@/src/features/trainers/components/TrainerGrid";
import { TrainerSkeleton } from "@/src/features/trainers/components/TrainerSkeleton";
import { useTrainers } from "@/src/features/trainers/hooks/useTrainers";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { PageHeader } from "@/src/shared/components/ui/page-header";

export function TrainerPage() {
  const {
    trainers,
    isLoading,
    error,
    refetch,
  } = useTrainers();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Our Trainers"
        description="Meet our experienced trainers and explore their expertise."
      />

      {isLoading ? (
        <TrainerSkeleton />
      ) : error ? (
        <ErrorState
          title="Failed to Load Trainers"
          description={error}
          onRetry={refetch}
        />
      ) : trainers.length === 0 ? (
        <EmptyTrainer />
      ) : (
        <TrainerGrid
          trainers={trainers}
        />
      )}
    </div>
  );
}