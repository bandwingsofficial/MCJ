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

import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

const iconBtnClass =
  "h-9 w-9 shrink-0 rounded-lg p-0 transition-colors";
const iconClass = "h-[1.25rem] w-[1.25rem]";

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
      <div className="flex items-center justify-end gap-1">
        <Tooltip content="Restore batch timing">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onRestore(template)}
            aria-label="Restore batch timing"
            className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
          >
            <RotateCcw className={iconClass} />
          </Button>
        </Tooltip>

        <Tooltip content="Permanently delete">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onPermanentDelete(template)}
            aria-label="Permanently delete batch timing"
            className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
          >
            <Trash2 className={iconClass} />
          </Button>
        </Tooltip>
      </div>
    );
  }

  const isActive = template.isActive;

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip content="Edit batch timing">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onEdit(template)}
          aria-label="Edit batch timing"
          className={`${iconBtnClass} text-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Pencil className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip
        content={isActive ? "Deactivate" : "Activate"}
      >
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() =>
            isActive ? onDeactivate(template) : onActivate(template)
          }
          aria-label={isActive ? "Deactivate" : "Activate"}
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

      <Tooltip content="Archive batch timing">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onArchive(template)}
          aria-label="Archive batch timing"
          className={`${iconBtnClass} text-slate-600 hover:bg-slate-100 hover:text-[#102A56]`}
        >
          <Archive className={iconClass} />
        </Button>
      </Tooltip>
    </div>
  );
}
