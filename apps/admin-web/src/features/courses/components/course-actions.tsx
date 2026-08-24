"use client";

import Link from "next/link";
import {
  CircleCheck,
  Pencil,
  Power,
  Settings2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { CourseListItem } from "@/src/features/courses/types/course.types";
import { isArchivedCourse } from "@/src/features/courses/utils/course-bulk.utils";
import { courseManagePath } from "@/src/features/courses/utils/course-manage.routes";

const iconBtnClass =
  "h-9 w-9 shrink-0 rounded-lg p-0 transition-colors";

const iconClass = "h-[1.25rem] w-[1.25rem]";

interface Props {
  course: CourseListItem;
  disabled?: boolean;
  onActivate: (course: CourseListItem) => void;
  onDeactivate: (course: CourseListItem) => void;
  onEdit: (course: CourseListItem) => void;
}

export function CourseActions({
  course,
  disabled = false,
  onActivate,
  onDeactivate,
  onEdit,
}: Props) {
  const isArchived = isArchivedCourse(course);
  const isActive = course.status === "ACTIVE";
  const statusDisabled = disabled || isArchived;

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip
        content={
          isArchived
            ? "Archived courses cannot change status"
            : isActive
              ? "Deactivate course"
              : "Activate course"
        }
      >
        <Button
          variant="ghost"
          size="sm"
          disabled={statusDisabled}
          onClick={() =>
            isActive ? onDeactivate(course) : onActivate(course)
          }
          aria-label={
            isActive ? "Deactivate course" : "Activate course"
          }
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

      <Tooltip content="Edit course">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onEdit(course)}
          aria-label="Edit course"
          className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Pencil className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip content="Manage course">
        <Link
          href={courseManagePath(course.id)}
          aria-label="Manage course"
          className={`${iconBtnClass} inline-flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 ${
            disabled ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <Settings2 className={iconClass} />
        </Link>
      </Tooltip>
    </div>
  );
}
