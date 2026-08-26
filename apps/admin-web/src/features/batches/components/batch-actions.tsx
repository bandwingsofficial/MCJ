"use client";

import {
  CircleCheck,
  Pencil,
  Power,
  RotateCcw,
  Settings2,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { BatchListItem } from "@/src/features/batches/types/batch.types";
import { isArchivedBatch } from "@/src/features/batches/utils/batch-bulk.utils";

const iconBtnClass =
  "h-9 w-9 shrink-0 rounded-lg p-0 transition-colors";
const iconClass = "h-[1.25rem] w-[1.25rem]";

interface Props {
  batch: BatchListItem;
  disabled?: boolean;
  onActivate: (batch: BatchListItem) => void;
  onDeactivate: (batch: BatchListItem) => void;
  onEdit: (batch: BatchListItem) => void;
  onManage: (batch: BatchListItem) => void;
  onRestore: (batch: BatchListItem) => void;
  onPermanentDelete: (batch: BatchListItem) => void;
}

export function BatchActions({
  batch,
  disabled = false,
  onActivate,
  onDeactivate,
  onEdit,
  onManage,
  onRestore,
  onPermanentDelete,
}: Props) {
  const isArchived = isArchivedBatch(batch);

  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Tooltip content="Restore batch">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onRestore(batch)}
            aria-label="Restore batch"
            className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
          >
            <RotateCcw className={iconClass} />
          </Button>
        </Tooltip>

        <Tooltip content="Permanently delete batch">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onPermanentDelete(batch)}
            aria-label="Permanently delete batch"
            className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
          >
            <Trash2 className={iconClass} />
          </Button>
        </Tooltip>
      </div>
    );
  }

  const isActive = batch.isActive !== false;

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip content={isActive ? "Deactivate batch" : "Activate batch"}>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() =>
            isActive ? onDeactivate(batch) : onActivate(batch)
          }
          aria-label={isActive ? "Deactivate batch" : "Activate batch"}
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

      <Tooltip content="Edit batch">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onEdit(batch)}
          aria-label="Edit batch"
          className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Pencil className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip content="Batch management">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onManage(batch)}
          aria-label="Batch management"
          className={`${iconBtnClass} text-slate-700 hover:bg-slate-100 hover:text-slate-900`}
        >
          <Settings2 className={iconClass} />
        </Button>
      </Tooltip>
    </div>
  );
}
