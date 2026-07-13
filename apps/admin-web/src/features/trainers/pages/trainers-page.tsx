"use client";

import { useState } from "react";

import { PageHeader } from "@/src/shared/components/ui/page-header";

import { Button } from "@/src/shared/components/ui/button";
import { useCreateTrainer } from "@/src/features/trainers/hooks/use-create-trainer";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { useActivateTrainer } from "@/src/features/trainers/hooks/use-activate-trainer";
import { useDeactivateTrainer } from "@/src/features/trainers/hooks/use-deactivate-trainer";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { useDeleteTrainer } from "@/src/features/trainers/hooks/use-delete-trainer";
import { useRestoreTrainer } from "@/src/features/trainers/hooks/use-restore-trainer";
import { usePermanentDeleteTrainer } from "@/src/features/trainers/hooks/use-permanent-delete-trainer";
import { useTrainers } from "@/src/features/trainers/hooks/use-trainers";

import { TrainerTable } from "@/src/features/trainers/components/trainer-table";

import { TrainerForm } from "@/src/features/trainers/components/trainer-form";

import { TrainerFilters } from "@/src/features/trainers/components/trainer-filters";

import { TrainerEmptyState } from "@/src/features/trainers/components/trainer-empty-state";

import type {
  TrainerDetails,
} from "@/src/features/trainers/types/trainer.types";
import { Card } from "@/src/shared/components/ui/card";

export function TrainersPage() {
  const {
    trainers,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
  } = useTrainers();
const {
    activateTrainer,
} = useActivateTrainer();
const { deleteTrainer } = useDeleteTrainer();

const { restoreTrainer } = useRestoreTrainer();

const { permanentDeleteTrainer } =
  usePermanentDeleteTrainer();
const {
    deactivateTrainer,
} = useDeactivateTrainer();
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
const {
    createTrainer,
    isLoading: creatingTrainer,
} = useCreateTrainer();

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
 <Card>
          <div className="p-0">
      <TrainerFilters
        filters={filters}
        onChange={
          setFilters
        }
      />
      </div>
        </Card>

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
    onEdit={handleEdit}
    onDelete={async (trainer) => {
    const success = await deleteTrainer(trainer.id);

    if (success) {
        await refetch();
    }
}}

onRestore={async (trainer) => {
    const success = await restoreTrainer(trainer.id);

    if (success) {
        await refetch();
    }
}}
    onActivate={async (trainer) => {
        const success = await activateTrainer(trainer.id);

        if (success) {
            await refetch();
        }
    }}
    onDeactivate={async (trainer) => {
        const success = await deactivateTrainer(trainer.id);

        if (success) {
            await refetch();
        }
    }}
    onPermanentDelete={async (trainer) => {

        const success =
            await permanentDeleteTrainer(trainer.id);

        if (success) {
            await refetch();
        }
    }}
/>
      )}

      <TrainerForm
        open={formOpen}
        trainer={
          selectedTrainer
        }
        loading={creatingTrainer}
        onClose={() =>
          setFormOpen(false)
        }
       onSubmit={async (values, image) => {
    const success = await createTrainer(
        values,
        image
    );

    if (success) {
        await refetch();
        setFormOpen(false);
    }
}}
      />
    </div>
  );
}