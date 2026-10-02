"use client";

import {
  Archive,
  CircleCheck,
  Loader2,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";
import { isArchivedTrainer } from "@/src/features/trainers/utils/trainer-bulk.utils";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface Props {
  trainer: TrainerListItem;
  disabled?: boolean;
  onEdit: (trainer: TrainerListItem) => void;
  onActivate: (trainer: TrainerListItem) => void;
  onDeactivate: (trainer: TrainerListItem) => void;
  onDelete: (trainer: TrainerListItem) => void;
  onRestore: (trainer: TrainerListItem) => void;
  onPermanentDelete: (trainer: TrainerListItem) => void;
  pendingLifecycleCheck?: {
    trainerId: string;
    action: "deactivate" | "delete";
  } | null;
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
  pendingLifecycleCheck = null,
}: Props) {
  const archived = isArchivedTrainer(trainer);
  const isActive = trainer.status === "ACTIVE";

  const deactivateChecking =
    pendingLifecycleCheck?.trainerId === trainer.id &&
    pendingLifecycleCheck.action === "deactivate";
  const deleteChecking =
    pendingLifecycleCheck?.trainerId === trainer.id &&
    pendingLifecycleCheck.action === "delete";

  if (archived) {
    return (
      <div className="flex items-center justify-end gap-2">
        <Tooltip content="Restore trainer">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRestore(trainer)}
            aria-label="Restore trainer"
            className={`${iconButtonClass} text-green-800`}
          >
            <RotateCcw className={iconClass} />
          </button>
        </Tooltip>

        <Tooltip content="Permanently delete trainer">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPermanentDelete(trainer)}
            aria-label="Permanently delete trainer"
            className={`${iconButtonClass} text-red-800`}
          >
            <Trash2 className={iconClass} />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {isActive ? (
        <Tooltip content="Deactivate trainer">
          <button
            type="button"
            disabled={disabled || deactivateChecking}
            aria-busy={deactivateChecking}
            onClick={() => onDeactivate(trainer)}
            aria-label="Deactivate trainer"
            className={`${iconButtonClass} text-orange-700`}
          >
            {deactivateChecking ? (
              <Loader2 className={`${iconClass} animate-spin`} aria-hidden />
            ) : (
              <Power className={iconClass} />
            )}
          </button>
        </Tooltip>
      ) : (
        <Tooltip content="Activate trainer">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onActivate(trainer)}
            aria-label="Activate trainer"
            className={`${iconButtonClass} text-green-800`}
          >
            <CircleCheck className={iconClass} />
          </button>
        </Tooltip>
      )}

      <Tooltip content="Edit trainer">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(trainer)}
          aria-label="Edit trainer"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Pencil className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content="Archive trainer">
        <button
          type="button"
          disabled={disabled || deleteChecking}
          aria-busy={deleteChecking}
          onClick={() => onDelete(trainer)}
          aria-label="Archive trainer"
          className={`${iconButtonClass} text-red-800`}
        >
          {deleteChecking ? (
            <Loader2 className={`${iconClass} animate-spin`} aria-hidden />
          ) : (
            <Archive className={iconClass} />
          )}
        </button>
      </Tooltip>
    </div>
  );
}
