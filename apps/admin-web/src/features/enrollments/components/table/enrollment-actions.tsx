"use client";

import { Pencil, Settings2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { Enrollment } from "@/src/features/enrollments/types";

const iconBtnClass =
  "h-9 w-9 shrink-0 rounded-lg p-0 transition-colors";
const iconClass = "h-[1.25rem] w-[1.25rem]";

interface Props {
  enrollment: Enrollment;
  disabled?: boolean;
  onEdit: (enrollment: Enrollment) => void;
  onManage: (enrollment: Enrollment) => void;
}

export function EnrollmentActions({
  enrollment,
  disabled = false,
  onEdit,
  onManage,
}: Props) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip content="Edit enrollment">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onEdit(enrollment)}
          aria-label="Edit enrollment"
          className={`${iconBtnClass} text-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Pencil className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip content="Manage enrollment">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onManage(enrollment)}
          aria-label="Manage enrollment"
          className={`${iconBtnClass} text-slate-700 hover:bg-slate-100 hover:text-[#102A56]`}
        >
          <Settings2 className={iconClass} />
        </Button>
      </Tooltip>
    </div>
  );
}
