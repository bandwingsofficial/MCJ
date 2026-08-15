"use client";

import {
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";
import { isArchivedTrainer } from "@/src/features/trainers/utils/trainer-bulk.utils";

const iconBtnClass =
  "h-10 w-10 shrink-0 rounded-lg p-0";

const iconClass = "h-[1.35rem] w-[1.35rem]";

interface Props {
  trainer: TrainerListItem;
  disabled?: boolean;
  onEdit: (trainer: TrainerListItem) => void;
  onActivate: (trainer: TrainerListItem) => void;
  onDeactivate: (trainer: TrainerListItem) => void;
  onDelete: (trainer: TrainerListItem) => void;
  onRestore: (trainer: TrainerListItem) => void;
  onPermanentDelete: (trainer: TrainerListItem) => void;
}

export function TrainerActions({
  trainer,
  disabled = false,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
}: Props) {
  const isArchived = isArchivedTrainer(trainer);

  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onRestore(trainer)}
          title="Restore trainer"
          aria-label="Restore trainer"
          className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
        >
          <RotateCcw className={iconClass} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onPermanentDelete(trainer)}
          title="Permanently delete trainer"
          aria-label="Permanently delete trainer"
          className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
        >
          <Trash2 className={iconClass} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
      {trainer.status === "ACTIVE" ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onDeactivate(trainer)}
          title="Deactivate trainer"
          aria-label="Deactivate trainer"
          className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
        >
          <Power className={iconClass} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onActivate(trainer)}
          title="Activate trainer"
          aria-label="Activate trainer"
          className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
        >
          <Power className={iconClass} />
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onEdit(trainer)}
        title="Edit trainer"
        aria-label="Edit trainer"
        className={`${iconBtnClass} text-slate-700 hover:bg-slate-100`}
      >
        <Pencil className={iconClass} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onDelete(trainer)}
        title="Delete trainer"
        aria-label="Delete trainer"
        className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
      >
        <Trash2 className={iconClass} />
      </Button>
    </div>
  );
}
