"use client";

import {
  CircleCheck,
  Power,
  Settings2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { BatchListItem } from "@/src/features/batches/types/batch.types";
import { isArchivedBatch } from "@/src/features/batches/utils/batch-bulk.utils";

const iconBtnClass = "h-10 w-10 shrink-0 rounded-lg p-0";
const iconClass = "h-[1.35rem] w-[1.35rem]";

interface Props {
  batch: BatchListItem;
  disabled?: boolean;
  onManage: (batch: BatchListItem) => void;
  onActivate: (batch: BatchListItem) => void;
  onDeactivate: (batch: BatchListItem) => void;
}

export function BatchActions({
  batch,
  disabled = false,
  onManage,
  onActivate,
  onDeactivate,
}: Props) {
  if (isArchivedBatch(batch)) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onManage(batch)}
          title="Manage batch"
          aria-label="Manage batch"
          className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Settings2 className={iconClass} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onManage(batch)}
        title="Manage batch"
        aria-label="Manage batch"
        className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
      >
        <Settings2 className={iconClass} />
      </Button>

      {batch.isActive === false ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onActivate(batch)}
          title="Activate batch"
          aria-label="Activate batch"
          className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
        >
          <CircleCheck className={iconClass} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onDeactivate(batch)}
          title="Deactivate batch"
          aria-label="Deactivate batch"
          className={`${iconBtnClass} text-amber-600 hover:bg-amber-50 hover:text-amber-700`}
        >
          <Power className={iconClass} />
        </Button>
      )}
    </div>
  );
}
