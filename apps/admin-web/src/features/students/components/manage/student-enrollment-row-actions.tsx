"use client";

import { CircleCheck, Power, Settings2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

const iconBtnClass = "h-10 w-10 shrink-0 rounded-lg p-0";
const iconClass = "h-[1.35rem] w-[1.35rem]";

function isArchivedEnrollment(enrollment: Enrollment): boolean {
  return Boolean(enrollment.isDeleted || enrollment.deletedAt);
}

interface Props {
  enrollment: Enrollment;
  disabled?: boolean;
  onManageEdit: (enrollment: Enrollment) => void;
  onManageDelete: (enrollment: Enrollment) => void;
  onManageRestore: (enrollment: Enrollment) => void;
  onManagePermanentDelete: (enrollment: Enrollment) => void;
  onActivate: (enrollment: Enrollment) => void;
  onDeactivate: (enrollment: Enrollment) => void;
}

export function StudentEnrollmentRowActions({
  enrollment,
  disabled = false,
  onManageEdit,
  onManageDelete,
  onManageRestore,
  onManagePermanentDelete,
  onActivate,
  onDeactivate,
}: Props) {
  const archived = isArchivedEnrollment(enrollment);

  const manageItems = archived
    ? [
        {
          label: "Restore",
          onClick: () => onManageRestore(enrollment),
        },
        {
          label: "Permanent Delete",
          onClick: () => onManagePermanentDelete(enrollment),
          destructive: true,
        },
      ]
    : [
        { label: "Edit", onClick: () => onManageEdit(enrollment) },
        {
          label: "Delete",
          onClick: () => onManageDelete(enrollment),
          destructive: true,
        },
      ];

  if (archived) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Dropdown
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              title="Manage enrollment"
              aria-label="Manage enrollment"
              className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
            >
              <Settings2 className={iconClass} />
            </Button>
          }
          items={manageItems}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Dropdown
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            title="Manage enrollment"
            aria-label="Manage enrollment"
            className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
          >
            <Settings2 className={iconClass} />
          </Button>
        }
        items={manageItems}
      />

      {enrollment.isActive === false ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onActivate(enrollment)}
          title="Activate enrollment"
          aria-label="Activate enrollment"
          className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
        >
          <CircleCheck className={iconClass} />
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onDeactivate(enrollment)}
          title="Deactivate enrollment"
          aria-label="Deactivate enrollment"
          className={`${iconBtnClass} text-amber-600 hover:bg-amber-50 hover:text-amber-700`}
        >
          <Power className={iconClass} />
        </Button>
      )}
    </div>
  );
}
