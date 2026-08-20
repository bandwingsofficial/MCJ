"use client";

import {
  CircleCheck,
  Power,
  Settings2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { Student } from "@/src/features/students/types/student.types";
import { isArchivedStudent } from "@/src/features/students/utils/student-bulk.utils";

const iconBtnClass = "h-10 w-10 shrink-0 rounded-lg p-0";
const iconClass = "h-[1.35rem] w-[1.35rem]";

interface Props {
  student: Student;
  disabled?: boolean;
  onManage: (student: Student) => void;
  onActivate: (student: Student) => void;
  onDeactivate: (student: Student) => void;
}

export function StudentActions({
  student,
  disabled = false,
  onManage,
  onActivate,
  onDeactivate,
}: Props) {
  if (isArchivedStudent(student)) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onManage(student)}
          title="Manage student"
          aria-label="Manage student"
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
        onClick={() => onManage(student)}
        title="Manage student"
        aria-label="Manage student"
        className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
      >
        <Settings2 className={iconClass} />
      </Button>

      {student.isActive === false ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onActivate(student)}
          title="Activate student"
          aria-label="Activate student"
          className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
        >
          <CircleCheck className={iconClass} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onDeactivate(student)}
          title="Deactivate student"
          aria-label="Deactivate student"
          className={`${iconBtnClass} text-amber-600 hover:bg-amber-50 hover:text-amber-700`}
        >
          <Power className={iconClass} />
        </Button>
      )}
    </div>
  );
}
