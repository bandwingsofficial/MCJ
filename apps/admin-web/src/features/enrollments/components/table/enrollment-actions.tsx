"use client";

import { Archive, Pencil, Settings2 } from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { Enrollment } from "@/src/features/enrollments/types";
import {
  canUnenrollEnrollment,
  isCurrentEnrollmentStatus,
} from "@/src/features/enrollments/utils/current-enrollment";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

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
    <div className="flex items-center justify-end gap-2">
      {isCurrent ? (
        <Tooltip content="Edit enrollment">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onEdit(enrollment)}
            aria-label="Edit enrollment"
            className={`${iconButtonClass} text-blue-900`}
          >
            <Pencil className={iconClass} />
          </button>
        </Tooltip>
      ) : null}

      <Tooltip
        content={isCurrent ? "Manage enrollment" : "View enrollment history"}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => onManage(enrollment)}
          aria-label={
            isCurrent ? "Manage enrollment" : "View enrollment history"
          }
          className={`${iconButtonClass} text-green-800`}
        >
          <Settings2 className={iconClass} />
        </button>
      </Tooltip>

      {showUnenroll ? (
        <Tooltip content="Unenroll student">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onUnenroll(enrollment)}
            aria-label="Unenroll student"
            className={`${iconButtonClass} text-red-800`}
          >
            <Archive className={iconClass} />
          </button>
        </Tooltip>
      ) : null}
    </div>
  );
}
