"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

import type { CourseListItem } from "@/src/features/courses/types/course.types";

const iconBtnClass =
  "h-10 w-10 shrink-0 rounded-lg p-0";

const iconClass = "h-[1.35rem] w-[1.35rem]";

interface Props {
  course: CourseListItem;
  disabled?: boolean;
}

export function CourseActions({
  course,
  disabled = false,
}: Props) {
  return (
    <div className="flex items-center justify-end whitespace-nowrap">
      <Link
        href={`/courses/${course.id}/manage`}
        title="Manage course"
        aria-label="Manage course"
        className={`inline-flex items-center justify-center ${iconBtnClass} text-slate-700 hover:bg-slate-100 ${
          disabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <Settings className={iconClass} />
      </Link>
    </div>
  );
}
