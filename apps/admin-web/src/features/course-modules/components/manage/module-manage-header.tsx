"use client";

import Link from "next/link";

import { CourseModuleStatusBadge } from "@/src/features/course-modules/components/CourseModuleStatusBadge";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import { formatModuleOrderLabel } from "@/src/features/course-lessons/utils/lesson-order.utils";
import { courseManagePath } from "@/src/features/courses/utils/course-manage.routes";

interface Props {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  module: CourseModule;
}

function formatModuleNumber(order: number) {
  return formatModuleOrderLabel(order);
}

export function ModuleManageHeader({
  courseId,
  courseTitle,
  courseCode,
  module,
}: Props) {
  return (
    <>
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[#647A9B]">
        <Link
          href="/courses"
          className="font-medium text-[#2563EB] hover:underline"
        >
          Courses
        </Link>
        <span aria-hidden>›</span>
        <Link
          href={courseManagePath(courseId)}
          className="font-medium text-[#2563EB] hover:underline"
        >
          {courseTitle} ({courseCode})
        </Link>
        <span aria-hidden>›</span>
        <span className="text-slate-700">Management</span>
        <span aria-hidden>›</span>
        <Link
          href={courseManagePath(courseId)}
          className="font-medium text-[#2563EB] hover:underline"
        >
          Modules
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-[#102A56]">{module.title}</span>
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-[#102A56] sm:text-2xl">
            {module.title}
          </h1>
          <p className="mt-1 text-sm text-[#647A9B]">
            Module {formatModuleNumber(module.displayOrder)}
          </p>
          {module.description ? (
            <p className="mt-2 text-sm text-slate-600">{module.description}</p>
          ) : null}
          <div className="mt-2">
            <CourseModuleStatusBadge module={module} />
          </div>
        </div>
      </div>
    </>
  );
}
