"use client";

import { Card } from "@/src/shared/components/ui/card";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

interface BatchTrainerCardProps {
  batch: Batch;
}

export function BatchTrainerCard({
  batch,
}: BatchTrainerCardProps) {
  if (
    batch.trainers.length === 0
  ) {
    return (
      <EmptyState
        title="No Trainers"
        description="Trainer information is not available."
      />
    );
  }

  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-xl font-semibold">
        Trainers
      </h2>

      <div className="space-y-3">
        {batch.trainers.map(
          (trainer) => (
            <div
              key={trainer.id}
              className="rounded-lg border p-4"
            >
              <h3 className="font-medium">
                {trainer.firstName}{" "}
                {trainer.lastName}
              </h3>

              <p className="text-sm text-slate-500">
                {trainer.employeeCode}
              </p>
            </div>
          ),
        )}
      </div>
    </Card>
  );
}