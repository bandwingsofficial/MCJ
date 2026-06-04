"use client";

import { Sheet } from "@/src/shared/components/ui/sheet";

import type {
  TrainerDetails,
} from "@/src/features/trainers/types/trainer.types";

interface Props {
  open: boolean;

  trainer: TrainerDetails | null;

  onClose: () => void;
}

export function TrainerDetailsSheet({
  open,
  trainer,
  onClose,
}: Props) {
  if (!trainer) {
    return null;
  }

  return (
    <Sheet
      open={open}
      title="Trainer Details"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-500">
            Name
          </p>

          <p>
            {trainer.firstName}{" "}
            {trainer.lastName}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Email
          </p>

          <p>
            {trainer.email ||
              "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Phone
          </p>

          <p>
            {trainer.phone ||
              "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Trainer Type
          </p>

          <p>
            {
              trainer.trainerType
            }
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Specialization
          </p>

          <p>
            {trainer.specialization ||
              "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Experience
          </p>

          <p>
            {trainer.experienceYears ??
              "-"}{" "}
            Years
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Rating
          </p>

          <p>
            {
              trainer.averageRating
            }
          </p>
        </div>
      </div>
    </Sheet>
  );
}