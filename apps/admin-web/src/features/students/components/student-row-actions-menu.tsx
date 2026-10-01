"use client";

import {
  CircleCheck,
  Pencil,
  Power,
  RotateCcw,
  Settings2,
  Trash2,
} from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { StudentListItem } from "@/src/features/students/types/student.types";
import { isArchivedStudent } from "@/src/features/students/utils/student-bulk.utils";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

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
    return (
      <div className="flex items-center justify-end gap-2">
        {onRestore ? (
          <Tooltip content="Restore student">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onRestore(student)}
              aria-label="Restore student"
              className={`${iconButtonClass} text-green-800`}
            >
              <RotateCcw className={iconClass} />
            </button>
          </Tooltip>
        ) : null}

        {onPermanentDelete ? (
          <Tooltip content="Permanently delete student">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPermanentDelete(student)}
              aria-label="Permanently delete student"
              className={`${iconButtonClass} text-red-800`}
            >
              <Trash2 className={iconClass} />
            </button>
          </Tooltip>
        ) : null}
      </div>
    );
  }

  const isActive = student.isActive !== false;

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip content={isActive ? "Deactivate student" : "Activate student"}>
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            isActive ? onDeactivate(student) : onActivate(student)
          }
          aria-label={isActive ? "Deactivate student" : "Activate student"}
          className={`${iconButtonClass} text-orange-700`}
        >
          {isActive ? (
            <Power className={iconClass} />
          ) : (
            <CircleCheck className={iconClass} />
          )}
        </button>
      </Tooltip>

      <Tooltip content="Edit student">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(student)}
          aria-label="Edit student"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Pencil className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content="Manage student">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onManage(student)}
          aria-label="Manage student"
          className={`${iconButtonClass} text-green-800`}
        >
          <Settings2 className={iconClass} />
        </button>
      </Tooltip>
    </div>
  );
}
