"use client";

import { Lock, LockOpen, Pencil, Settings2, Trash2 } from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface Props {
  isPreview: boolean;
  disabled?: boolean;
  onTogglePreview?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onManage?: () => void;
}

export function LessonTableActions({
  isPreview,
  disabled = false,
  onTogglePreview,
  onEdit,
  onDelete,
  onManage,
}: Props) {
  return (
    <div className="flex items-center justify-end gap-2">
      {onTogglePreview ? (
        <Tooltip
          content={
            isPreview ? "Lock from free preview" : "Unlock for free preview"
          }
        >
          <button
            type="button"
            disabled={disabled}
            onClick={onTogglePreview}
            aria-label={
              isPreview ? "Lock from free preview" : "Unlock for free preview"
            }
            className={`${iconButtonClass} ${
              isPreview ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {isPreview ? (
              <Lock className={iconClass} />
            ) : (
              <LockOpen className={iconClass} />
            )}
          </button>
        </Tooltip>
      ) : null}

      {onEdit ? (
        <Tooltip content="Edit lesson">
          <button
            type="button"
            disabled={disabled}
            onClick={onEdit}
            aria-label="Edit lesson"
            className={`${iconButtonClass} text-blue-900`}
          >
            <Pencil className={iconClass} />
          </button>
        </Tooltip>
      ) : null}

      {onDelete ? (
        <Tooltip content="Delete lesson">
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            aria-label="Delete lesson"
            className={`${iconButtonClass} text-red-800`}
          >
            <Trash2 className={iconClass} />
          </button>
        </Tooltip>
      ) : null}

      {onManage ? (
        <Tooltip content="Manage lesson">
          <button
            type="button"
            disabled={disabled}
            onClick={onManage}
            aria-label="Manage lesson"
            className={`${iconButtonClass} text-blue-900`}
          >
            <Settings2 className={iconClass} />
          </button>
        </Tooltip>
      ) : null}
    </div>
  );
}
