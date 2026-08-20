"use client";

import { Settings2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type { StudentListItem } from "@/src/features/students/types/student.types";
import { isArchivedStudent } from "@/src/features/students/utils/student-bulk.utils";

const iconBtnClass = "h-10 w-10 shrink-0 rounded-lg p-0";
const iconClass = "h-[1.35rem] w-[1.35rem]";

interface Props {
  student: StudentListItem;
  disabled?: boolean;
  onManage: (student: StudentListItem) => void;
  onEdit: (student: StudentListItem) => void;
  onActivate: (student: StudentListItem) => void;
  onDeactivate: (student: StudentListItem) => void;
  onDelete: (student: StudentListItem) => void;
  onRestore: (student: StudentListItem) => void;
  onPermanentDelete: (student: StudentListItem) => void;
}

export function StudentRowActionsMenu({
  student,
  disabled = false,
  onManage,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
}: Props) {
  const archived = isArchivedStudent(student);

  const items = archived
    ? [
        { label: "View / Manage", onClick: () => onManage(student) },
        { label: "Restore", onClick: () => onRestore(student) },
        {
          label: "Permanent Delete",
          onClick: () => onPermanentDelete(student),
          destructive: true,
        },
      ]
    : [
        { label: "View / Manage", onClick: () => onManage(student) },
        { label: "Edit", onClick: () => onEdit(student) },
        student.isActive === false
          ? { label: "Activate", onClick: () => onActivate(student) }
          : { label: "Deactivate", onClick: () => onDeactivate(student) },
        {
          label: "Delete",
          onClick: () => onDelete(student),
          destructive: true,
        },
      ];

  return (
    <Dropdown
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          title="Student actions"
          aria-label="Student actions"
          className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Settings2 className={iconClass} />
        </Button>
      }
      items={items}
    />
  );
}
