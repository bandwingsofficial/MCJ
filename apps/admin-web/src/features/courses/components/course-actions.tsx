"use client";

import Link from "next/link";
import {
  CircleCheck,
  Loader2,
  Pencil,
  Power,
  Settings2,
} from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { CourseListItem } from "@/src/features/courses/types/course.types";
import { isArchivedCourse } from "@/src/features/courses/utils/course-bulk.utils";
import { courseManagePath } from "@/src/features/courses/utils/course-manage.routes";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface Props {
  course: CourseListItem;
  disabled?: boolean;
  onActivate: (course: CourseListItem) => void;
  onDeactivate: (course: CourseListItem) => void;
  onEdit: (course: CourseListItem) => void;
  pendingLifecycleCheck?: {
    courseId: string;
    action: "deactivate";
  } | null;
}

export function CourseActions({
  course,
  disabled = false,
  onActivate,
  onDeactivate,
  onEdit,
  pendingLifecycleCheck = null,
}: Props) {
  const archived = isArchivedCourse(course);
  const isActive = course.status === "ACTIVE";
  const deactivateChecking =
    pendingLifecycleCheck?.courseId === course.id &&
    pendingLifecycleCheck.action === "deactivate";

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip content="Edit course">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(course)}
          aria-label="Edit course"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Pencil className={iconClass} />
        </button>
      </Tooltip>

      {!archived ? (
        isActive ? (
          <Tooltip content="Deactivate course">
            <button
              type="button"
              disabled={disabled || deactivateChecking}
              aria-busy={deactivateChecking}
              onClick={() => onDeactivate(course)}
              aria-label="Deactivate course"
              className={`${iconButtonClass} text-orange-700`}
            >
              {deactivateChecking ? (
                <Loader2
                  className={`${iconClass} animate-spin`}
                  aria-hidden
                />
              ) : (
                <Power className={iconClass} />
              )}
            </button>
          </Tooltip>
        ) : (
          <Tooltip content="Activate course">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onActivate(course)}
              aria-label="Activate course"
              className={`${iconButtonClass} text-green-800`}
            >
              <CircleCheck className={iconClass} />
            </button>
          </Tooltip>
        )
      ) : null}

      <Tooltip content="Manage course">
        <Link
          href={courseManagePath(course.id)}
          aria-label="Manage course"
          className={`${iconButtonClass} text-[#102A56] ${
            disabled ? "pointer-events-none opacity-40" : ""
          }`}
        >
          <Settings2 className={iconClass} />
        </Link>
      </Tooltip>
    </div>
  );
}
