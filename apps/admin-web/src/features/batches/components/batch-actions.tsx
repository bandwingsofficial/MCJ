"use client";

import { useRouter } from "next/navigation";
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
import { batchManagePath } from "@/src/features/batches/utils/batch-manage.routes";

const iconBtnClass =
  "h-9 w-9 shrink-0 rounded-lg p-0 transition-colors";
const iconClass = "h-[1.25rem] w-[1.25rem]";

interface Props {
  batch: BatchListItem;
  disabled?: boolean;
  onActivate: (batch: BatchListItem) => void;
  onDeactivate: (batch: BatchListItem) => void;
  onEdit: (batch: BatchListItem) => void;
  onRestore: (batch: BatchListItem) => void;
  onPermanentDelete: (batch: BatchListItem) => void;
}

export function BatchActions({
  batch,
  disabled = false,
  onActivate,
  onDeactivate,
  onEdit,
  onRestore,
  onPermanentDelete,
}: Props) {
  const router = useRouter();
  const isArchived = isArchivedBatch(batch);
  const isActive = batch.isActive !== false;

  // Archived rows stay visible but only offer Restore / Permanent Delete.
  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Tooltip content="Restore batch">
          <Button
            type="button"
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

        <Tooltip content="Permanently delete">
          <Button
            type="button"
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

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip content={isActive ? "Deactivate batch" : "Activate batch"}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => (isActive ? onDeactivate(batch) : onActivate(batch))}
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
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onEdit(batch)}
          aria-label="Edit batch"
          className={`${iconBtnClass} text-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Pencil className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip content="Manage batch">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => router.push(batchManagePath(batch.id))}
          aria-label="Manage batch"
          className={`${iconBtnClass} text-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Settings2 className={iconClass} />
        </Button>
      </Tooltip>
    </div>
  );
}
