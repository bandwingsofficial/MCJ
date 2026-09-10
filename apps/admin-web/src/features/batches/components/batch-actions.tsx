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

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { BatchListItem } from "@/src/features/batches/types/batch.types";
import { isArchivedBatch } from "@/src/features/batches/utils/batch-bulk.utils";
import { batchManagePath } from "@/src/features/batches/utils/batch-manage.routes";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

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

  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-2">
        <Tooltip content="Restore batch">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRestore(batch)}
            aria-label="Restore batch"
            className={`${iconButtonClass} text-green-800`}
          >
            <RotateCcw className={iconClass} />
          </button>
        </Tooltip>

        <Tooltip content="Permanently delete batch">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPermanentDelete(batch)}
            aria-label="Permanently delete batch"
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
      <Tooltip content={isActive ? "Deactivate batch" : "Activate batch"}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => (isActive ? onDeactivate(batch) : onActivate(batch))}
          aria-label={isActive ? "Deactivate batch" : "Activate batch"}
          className={`${iconButtonClass} text-orange-700`}
        >
          {isActive ? (
            <Power className={iconClass} />
          ) : (
            <CircleCheck className={iconClass} />
          )}
        </button>
      </Tooltip>

      <Tooltip content="Edit batch">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(batch)}
          aria-label="Edit batch"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Pencil className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content="Manage batch">
        <button
          type="button"
          disabled={disabled}
          onClick={() => router.push(batchManagePath(batch.id))}
          aria-label="Manage batch"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Settings2 className={iconClass} />
        </button>
      </Tooltip>
    </div>
  );
}
