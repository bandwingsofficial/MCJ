"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { LessonPreviewAccessBadge } from "@/src/features/course-lessons/components/lesson-preview-access-badge";
import type { CourseLesson } from "@/src/features/course-lessons/types";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import {
  formatLessonOrderLabel,
  formatModuleOrderLabel,
} from "@/src/features/course-lessons/utils/lesson-order.utils";
import {
  courseManageModulePath,
  courseManagePath,
} from "@/src/features/courses/utils/course-manage.routes";

interface Props {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  module: CourseModule;
  lesson: CourseLesson;
  lessonPosition: number;
}

export function LessonManageHeader({
  courseId,
  courseTitle,
  courseCode,
  module,
  lesson,
  lessonPosition,
}: Props) {
  return (
    <div className="space-y-3">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-xs"
      >
        <Link
          href="/courses"
          className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
        >
          Courses
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <Link
          href={courseManagePath(courseId)}
          className="font-medium text-[#647A9B] transition-colors hover:text-[#2563EB]"
        >
          {courseTitle} ({courseCode})
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-[#102A56]">Management</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <Link
          href={courseManageModulePath(courseId, module.id)}
          className="font-medium text-[#647A9B] transition-colors hover:text-[#2563EB]"
        >
          {module.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-slate-700">{lesson.title}</span>
      </nav>

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-[#E8F0FA] bg-white p-3 shadow-[0_1px_4px_rgba(16,42,86,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Module
            </p>
            <h2 className="mt-1 text-base font-semibold text-[#102A56]">
              {module.title}
            </h2>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Module {formatModuleOrderLabel(module.displayOrder)}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-[#E8F0FA] bg-white p-3 shadow-[0_1px_4px_rgba(16,42,86,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Lesson
            </p>
            <h1 className="mt-1 text-lg font-semibold text-[#102A56] sm:text-xl">
              {lesson.title}
            </h1>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Lesson {formatLessonOrderLabel(lessonPosition)}
            </p>
          </div>
        </div>

        {lesson.description ? (
          <div className="border-t border-[#E8F0FA] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Description
            </p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">
              {lesson.description}
            </p>
          </div>
        ) : null}

        <div className="flex items-center gap-2 border-t border-[#E8F0FA] px-4 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            Preview Access
          </span>
          <LessonPreviewAccessBadge isPreview={lesson.isPreview} />
        </div>
      </div>
    </div>
  );
}
