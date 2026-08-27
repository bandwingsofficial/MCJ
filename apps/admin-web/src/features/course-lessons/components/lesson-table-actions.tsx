"use client";

import { Lock, LockOpen, Pencil, Settings2, Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

const iconBtnClass = "h-10 w-10 shrink-0 rounded-lg p-0";
const iconClass = "h-[1.35rem] w-[1.35rem]";
const lockIconClass = "h-[1.45rem] w-[1.45rem]";

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
    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
      {onTogglePreview ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onTogglePreview}
          title={isPreview ? "Lock from free preview" : "Unlock for free preview"}
          aria-label={
            isPreview ? "Lock from free preview" : "Unlock for free preview"
          }
          className={`${iconBtnClass} ${
            isPreview
              ? "text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          }`}
        >
          {isPreview ? (
            <Lock className={lockIconClass} />
          ) : (
            <LockOpen className={lockIconClass} />
          )}
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

      {onManage ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onManage}
          title="Manage"
          aria-label="Manage"
          className={`${iconBtnClass} text-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Settings2 className={iconClass} />
        </Button>
      ) : null}
    </div>
  );
}
