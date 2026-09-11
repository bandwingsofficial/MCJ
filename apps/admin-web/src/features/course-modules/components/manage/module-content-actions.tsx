"use client";

import {
  CircleCheck,
  Pencil,
  Power,
  Settings2,
  Trash2,
} from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface Props {
  isArchived: boolean;
  disabled?: boolean;
  showManage?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onManage?: () => void;
}

export function ModuleContentActions({
  isArchived,
  disabled = false,
  showManage = false,
  onActivate,
  onDeactivate,
  onEdit,
  onDelete,
  onManage,
}: Props) {
  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-2">
        {onActivate ? (
          <Tooltip content="Activate">
            <button
              type="button"
              disabled={disabled}
              onClick={onActivate}
              aria-label="Activate"
              className={`${iconButtonClass} text-green-800`}
            >
              <CircleCheck className={iconClass} />
            </button>
          </Tooltip>
        ) : null}

        {onEdit ? (
          <Tooltip content="Edit">
            <button
              type="button"
              disabled={disabled}
              onClick={onEdit}
              aria-label="Edit"
              className={`${iconButtonClass} text-blue-900`}
            >
              <Pencil className={iconClass} />
            </button>
          </Tooltip>
        ) : null}

        {onDelete ? (
          <Tooltip content="Delete">
            <button
              type="button"
              disabled={disabled}
              onClick={onDelete}
              aria-label="Delete"
              className={`${iconButtonClass} text-red-800`}
            >
              <Trash2 className={iconClass} />
            </button>
          </Tooltip>
        ) : null}

        {showManage && onManage ? (
          <Tooltip content="Manage">
            <button
              type="button"
              disabled={disabled}
              onClick={onManage}
              aria-label="Manage"
              className={`${iconButtonClass} text-blue-900`}
            >
              <Settings2 className={iconClass} />
            </button>
          </Tooltip>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {onDeactivate ? (
        <Tooltip content="Deactivate">
          <button
            type="button"
            disabled={disabled}
            onClick={onDeactivate}
            aria-label="Deactivate"
            className={`${iconButtonClass} text-orange-700`}
          >
            <Power className={iconClass} />
          </button>
        </Tooltip>
      ) : null}

      {onEdit ? (
        <Tooltip content="Edit">
          <button
            type="button"
            disabled={disabled}
            onClick={onEdit}
            aria-label="Edit"
            className={`${iconButtonClass} text-blue-900`}
          >
            <Pencil className={iconClass} />
          </button>
        </Tooltip>
      ) : null}

      {onDelete ? (
        <Tooltip content="Delete">
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            aria-label="Delete"
            className={`${iconButtonClass} text-red-800`}
          >
            <Trash2 className={iconClass} />
          </button>
        </Tooltip>
      ) : null}

      {showManage && onManage ? (
        <Tooltip content="Manage">
          <button
            type="button"
            disabled={disabled}
            onClick={onManage}
            aria-label="Manage"
            className={`${iconButtonClass} text-blue-900`}
          >
            <Settings2 className={iconClass} />
          </button>
        </Tooltip>
      ) : null}
    </div>
  );
}
