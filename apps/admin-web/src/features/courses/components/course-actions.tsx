"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";

import type { CourseListItem } from "@/src/features/courses/types/course.types";
import { isArchivedCourse } from "@/src/features/courses/utils/course-bulk.utils";

const iconBtnClass =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg p-0";

const iconClass = "h-[1.35rem] w-[1.35rem]";

interface Props {
  course: CourseListItem;
  disabled?: boolean;
}

export function CourseActions({
  course,
  disabled = false,
}: Props) {
  const isArchived = isArchivedCourse(course);

  return (
    <div className="flex items-center justify-end whitespace-nowrap">
      <Link
        href={`/courses/${course.id}/manage`}
        title="Manage course"
        aria-label="Manage course"
        className={`${iconBtnClass} ${
          isArchived
            ? "text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]"
            : "text-slate-700 hover:bg-slate-100"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <Settings2 className={iconClass} />
      </Link>
    </div>
  );
}
