"use client";

import { Pencil, Settings2, UserMinus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { Enrollment } from "@/src/features/enrollments/types";
import {
  canUnenrollEnrollment,
  isCurrentEnrollmentStatus,
} from "@/src/features/enrollments/utils/current-enrollment";

const iconBtnClass =
  "h-9 w-9 shrink-0 rounded-lg p-0 transition-colors";
const iconClass = "h-[1.25rem] w-[1.25rem]";

interface Props {
  enrollment: Enrollment;
  disabled?: boolean;
  onEdit: (enrollment: Enrollment) => void;
  onManage: (enrollment: Enrollment) => void;
  onUnenroll?: (enrollment: Enrollment) => void;
}

export function EnrollmentActions({
  enrollment,
  disabled = false,
  onEdit,
  onManage,
  onUnenroll,
}: Props) {
  const isCurrent =
    !enrollment.isDeleted && isCurrentEnrollmentStatus(enrollment.status);
  const showUnenroll =
    onUnenroll && canUnenrollEnrollment(enrollment) && !enrollment.isDeleted;

  return (
    <div className="flex items-center justify-end gap-1">
      {showUnenroll ? (
        <Tooltip content="Unenroll student">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onUnenroll(enrollment)}
            aria-label="Unenroll student"
            className={`${iconBtnClass} text-rose-600 hover:bg-rose-50 hover:text-rose-700`}
          >
            <UserMinus className={iconClass} />
          </Button>
        </Tooltip>
      ) : null}

      {isCurrent ? (
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
      ) : null}

      <Tooltip content={isCurrent ? "Manage enrollment" : "View enrollment history"}>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onManage(enrollment)}
          aria-label={isCurrent ? "Manage enrollment" : "View enrollment history"}
          className={`${iconBtnClass} text-slate-700 hover:bg-slate-100 hover:text-[#102A56]`}
        >
          <Settings2 className={iconClass} />
        </Button>
      </Tooltip>
    </div>
  );
}
