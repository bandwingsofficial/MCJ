"use client";

import {
  Archive,
  CircleCheck,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";
import { isArchivedTrainer } from "@/src/features/trainers/utils/trainer-bulk.utils";

const iconBtnClass =
  "h-9 w-9 shrink-0 rounded-lg p-0 transition-colors";

const iconClass = "h-[1.25rem] w-[1.25rem]";

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
      <div className="flex items-center justify-end gap-1">
        <Tooltip content="Restore trainer">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onRestore(trainer)}
            aria-label="Restore trainer"
            className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
          >
            <RotateCcw className={iconClass} />
          </Button>
        </Tooltip>

        <Tooltip content="Permanently delete trainer">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onPermanentDelete(trainer)}
            aria-label="Permanently delete trainer"
            className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
          >
            <Trash2 className={iconClass} />
          </Button>
        </Tooltip>
      </div>
    );
  }

  const isActive = trainer.status === "ACTIVE";

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip
        content={isActive ? "Deactivate trainer" : "Activate trainer"}
      >
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() =>
            isActive ? onDeactivate(trainer) : onActivate(trainer)
          }
          aria-label={isActive ? "Deactivate trainer" : "Activate trainer"}
          className={`${iconBtnClass} ${
            isActive
              ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          }`}
        >
          {isActive ? (
            <Power className={iconClass} />
          ) : (
            <CircleCheck className={iconClass} />
          )}
        </Button>
      </Tooltip>

      <Tooltip content="Edit trainer">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onEdit(trainer)}
          aria-label="Edit trainer"
          className={`${iconBtnClass} text-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Pencil className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip content="Archive trainer">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onDelete(trainer)}
          aria-label="Archive trainer"
          className={`${iconBtnClass} text-slate-600 hover:bg-slate-100 hover:text-[#102A56]`}
        >
          <Archive className={iconClass} />
        </Button>
      </Tooltip>
    </div>
  );
}
