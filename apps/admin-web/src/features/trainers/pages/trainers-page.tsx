"use client";

import { useState } from "react";

import { PageHeader } from "@/src/shared/components/ui/page-header";

import { Button } from "@/src/shared/components/ui/button";

import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

import { ErrorState } from "@/src/shared/components/ui/error-state";

import { useTrainers } from "@/src/features/trainers/hooks/use-trainers";

import { TrainerTable } from "@/src/features/trainers/components/trainer-table";

import { TrainerForm } from "@/src/features/trainers/components/trainer-form";

import { TrainerFilters } from "@/src/features/trainers/components/trainer-filters";

import { TrainerEmptyState } from "@/src/features/trainers/components/trainer-empty-state";

import type {
  TrainerDetails,
} from "@/src/features/trainers/types/trainer.types";

export function TrainersPage() {
  const {
    trainers,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
  } = useTrainers();

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    selectedTrainer,
    setSelectedTrainer,
  ] =
    useState<TrainerDetails | null>(
      null
    );

  const handleCreate =
    () => {
      setSelectedTrainer(
        null
      );

      setFormOpen(true);
    };

  const handleEdit = (
    trainer: TrainerDetails
  ) => {
    setSelectedTrainer(
      trainer
    );

    setFormOpen(true);
  };

  if (error) {
    return (
      <ErrorState
        title="Failed To Load Trainers"
        description={error}
        onRetry={
          refetch
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trainers"
        description="Manage all trainers"
        actions={
          <Button
            onClick={
              handleCreate
            }
          >
            Create Trainer
          </Button>
        }
      />

      <TrainerFilters
        filters={filters}
        onChange={
          setFilters
        }
      />

      {isLoading ? (
        <SkeletonTable
          rows={10}
        />
      ) : trainers.length ===
        0 ? (
        <TrainerEmptyState />
      ) : (
        <TrainerTable
          trainers={trainers}
          onEdit={
            handleEdit
          }
          onDelete={() => {}}
          onRestore={() => {}}
          onActivate={() => {}}
          onDeactivate={() => {}}
        />
      )}

      <TrainerForm
        open={formOpen}
        trainer={
          selectedTrainer
        }
        loading={false}
        onClose={() =>
          setFormOpen(false)
        }
        onSubmit={async () => {
          await refetch();

          setFormOpen(false);
        }}
      />
    </div>
  );
}