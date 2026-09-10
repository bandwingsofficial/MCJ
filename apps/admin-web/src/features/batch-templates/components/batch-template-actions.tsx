"use client";

import {
  Archive,
  CircleCheck,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface Props {
  template: BatchTemplate;
  disabled?: boolean;
  onEdit: (template: BatchTemplate) => void;
  onActivate: (template: BatchTemplate) => void;
  onDeactivate: (template: BatchTemplate) => void;
  onArchive: (template: BatchTemplate) => void;
  onRestore: (template: BatchTemplate) => void;
  onPermanentDelete: (template: BatchTemplate) => void;
}

export function BatchTemplateActions({
  template,
  disabled = false,
  onEdit,
  onActivate,
  onDeactivate,
  onArchive,
  onRestore,
  onPermanentDelete,
}: Props) {
  const isArchived = Boolean(template.isDeleted);

  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-2">
        <Tooltip content="Restore batch timing">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRestore(template)}
            aria-label="Restore batch timing"
            className={`${iconButtonClass} text-green-800`}
          >
            <RotateCcw className={iconClass} />
          </button>
        </Tooltip>

        <Tooltip content="Permanently delete batch timing">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPermanentDelete(template)}
            aria-label="Permanently delete batch timing"
            className={`${iconButtonClass} text-red-800`}
          >
            <Trash2 className={iconClass} />
          </button>
        </Tooltip>
      </div>
    );
  }

  const isActive = template.isActive;

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip content={isActive ? "Deactivate" : "Activate"}>
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            isActive ? onDeactivate(template) : onActivate(template)
          }
          aria-label={isActive ? "Deactivate" : "Activate"}
          className={`${iconButtonClass} text-orange-700`}
        >
          {isActive ? (
            <Power className={iconClass} />
          ) : (
            <CircleCheck className={iconClass} />
          )}
        </button>
      </Tooltip>

      <Tooltip content="Edit batch timing">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(template)}
          aria-label="Edit batch timing"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Pencil className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content="Archive batch timing">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onArchive(template)}
          aria-label="Archive batch timing"
          className={`${iconButtonClass} text-red-800`}
        >
          <Archive className={iconClass} />
        </button>
      </Tooltip>
    </div>
  );
}
