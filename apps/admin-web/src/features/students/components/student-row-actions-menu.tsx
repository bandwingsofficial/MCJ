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

import type { StudentListItem } from "@/src/features/students/types/student.types";
import { isArchivedStudent } from "@/src/features/students/utils/student-bulk.utils";

const iconBtnClass =
  "h-9 w-9 shrink-0 rounded-lg p-0 transition-colors";
const iconClass = "h-[1.25rem] w-[1.25rem]";

interface Props {
  student: StudentListItem;
  disabled?: boolean;
  onManage: (student: StudentListItem) => void;
  onEdit: (student: StudentListItem) => void;
  onActivate: (student: StudentListItem) => void;
  onDeactivate: (student: StudentListItem) => void;
  onDelete?: (student: StudentListItem) => void;
  onRestore?: (student: StudentListItem) => void;
  onPermanentDelete?: (student: StudentListItem) => void;
}

export function StudentRowActionsMenu({
  student,
  disabled = false,
  onManage,
  onEdit,
  onActivate,
  onDeactivate,
  onRestore,
  onPermanentDelete,
}: Props) {
  if (isArchivedStudent(student)) {
    if (onRestore || onPermanentDelete) {
      return (
        <div className="flex items-center justify-end gap-1">
          {onRestore ? (
            <Tooltip content="Restore student">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => onRestore(student)}
                aria-label="Restore student"
                className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
              >
                <RotateCcw className={iconClass} />
              </Button>
            </Tooltip>
          ) : null}

          {onPermanentDelete ? (
            <Tooltip content="Permanently delete student">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => onPermanentDelete(student)}
                aria-label="Permanently delete student"
                className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
              >
                <Trash2 className={iconClass} />
              </Button>
            </Tooltip>
          ) : null}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-end gap-1">
        <Tooltip content="Manage student">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onManage(student)}
            aria-label="Manage student"
            className={`${iconBtnClass} text-slate-700 hover:bg-slate-100 hover:text-[#102A56]`}
          >
            <Settings2 className={iconClass} />
          </Button>
        </Tooltip>
      </div>
    );
  }

  const isActive = student.isActive !== false;

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip content={isActive ? "Deactivate student" : "Activate student"}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() =>
            isActive ? onDeactivate(student) : onActivate(student)
          }
          aria-label={isActive ? "Deactivate student" : "Activate student"}
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

      <Tooltip content="Edit student">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onEdit(student)}
          aria-label="Edit student"
          className={`${iconBtnClass} text-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Pencil className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip content="Manage student">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onManage(student)}
          aria-label="Manage student"
          className={`${iconBtnClass} text-slate-700 hover:bg-slate-100 hover:text-[#102A56]`}
        >
          <Settings2 className={iconClass} />
        </Button>
      </Tooltip>
    </div>
  );
}
