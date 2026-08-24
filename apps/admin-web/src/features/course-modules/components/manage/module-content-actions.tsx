"use client";

import {
  CircleCheck,
  Pencil,
  Power,
  Settings2,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

const iconBtnClass =
  "h-10 w-10 shrink-0 rounded-lg p-0";

const iconClass = "h-[1.35rem] w-[1.35rem]";

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
      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
        {onActivate ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={onActivate}
            title="Activate"
            aria-label="Activate"
            className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
          >
            <CircleCheck className={iconClass} />
          </Button>
        ) : null}

        {onEdit ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={onEdit}
            title="Edit"
            aria-label="Edit"
            className={`${iconBtnClass} text-slate-700 hover:bg-slate-100`}
          >
            <Pencil className={iconClass} />
          </Button>
        ) : null}

        {onDelete ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={onDelete}
            title="Delete"
            aria-label="Delete"
            className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
          >
            <Trash2 className={iconClass} />
          </Button>
        ) : null}

        {showManage && onManage ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={onManage}
            title="Manage"
            aria-label="Manage"
            className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
          >
            <Settings2 className={iconClass} />
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
      {onDeactivate ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onDeactivate}
          title="Deactivate"
          aria-label="Deactivate"
          className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
        >
          <Power className={iconClass} />
        </Button>
      ) : null}

      {onEdit ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onEdit}
          title="Edit"
          aria-label="Edit"
          className={`${iconBtnClass} text-slate-700 hover:bg-slate-100`}
        >
          <Pencil className={iconClass} />
        </Button>
      ) : null}

      {onDelete ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onDelete}
          title="Delete"
          aria-label="Delete"
          className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
        >
          <Trash2 className={iconClass} />
        </Button>
      ) : null}

      {showManage && onManage ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onManage}
          title="Manage"
          aria-label="Manage"
          className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Settings2 className={iconClass} />
        </Button>
      ) : null}
    </div>
  );
}
