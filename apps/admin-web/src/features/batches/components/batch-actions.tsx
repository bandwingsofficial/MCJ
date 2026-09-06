"use client";

import {
  CircleCheck,
  Pencil,
  Power,
  Settings2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";
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
  onArchive: (batch: BatchListItem) => void;
  onRestore: (batch: BatchListItem) => void;
  onPermanentDelete: (batch: BatchListItem) => void;
}

export function BatchActions({
  batch,
  disabled = false,
  onActivate,
  onDeactivate,
  onEdit,
  onArchive,
  onRestore,
  onPermanentDelete,
}: Props) {
  const isArchived = isArchivedBatch(batch);
  const isActive = batch.isActive !== false;

  const managementItems = isArchived
    ? [
        {
          label: "Restore",
          onClick: () => onRestore(batch),
        },
        {
          label: "Delete Permanently",
          onClick: () => onPermanentDelete(batch),
          destructive: true,
        },
      ]
    : [
        {
          label: "Archive",
          onClick: () => onArchive(batch),
          destructive: true,
        },
      ];

  return (
    <div className="flex items-center justify-end gap-1">
      {!isArchived ? (
        <Tooltip content={isActive ? "Deactivate batch" : "Activate batch"}>
          <Button
            type="button"
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
      ) : null}

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

      <Dropdown
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            title="Management"
            aria-label="Management"
            className={`${iconBtnClass} text-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]`}
          >
            <Settings2 className={iconClass} />
          </Button>
        }
        items={managementItems}
      />
    </div>
  );
}
