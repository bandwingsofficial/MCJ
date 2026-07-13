"use client";

import { TrainerCard } from "@/src/features/trainers/components/TrainerCard";

import type {
  Trainer,
} from "@/src/features/trainers/types/trainer.types";

interface TrainerGridProps {
  trainers: Trainer[];
}

export function TrainerGrid({
  trainers,
}: TrainerGridProps) {
  if (trainers.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {trainers.map(
        (trainer) => (
          <TrainerCard
            key={trainer.id}
            trainer={trainer}
          />
        ),
      )}
    </div>
  );
}