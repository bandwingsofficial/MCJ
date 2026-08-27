"use client";

import Link from "next/link";

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
        <Link
          href={courseManageModulePath(courseId, module.id)}
          className="font-medium text-[#2563EB] hover:underline"
        >
          {module.title}
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-[#102A56]">{lesson.title}</span>
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Module
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#102A56]">
              {module.title}
            </h2>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Module {formatModuleOrderLabel(module.displayOrder)}
            </p>
          </div>

          <div className="min-w-0 lg:border-l lg:border-slate-200 lg:pl-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Lesson
            </p>
            <h1 className="mt-1 text-xl font-semibold text-[#102A56] sm:text-2xl">
              {lesson.title}
            </h1>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Lesson {formatLessonOrderLabel(lessonPosition)}
            </p>
          </div>
        </div>

        {lesson.description ? (
          <p className="mt-3 text-sm text-slate-600">{lesson.description}</p>
        ) : null}

        <div className="mt-3">
          <LessonPreviewAccessBadge isPreview={lesson.isPreview} />
        </div>
      </div>
    </>
  );
}
