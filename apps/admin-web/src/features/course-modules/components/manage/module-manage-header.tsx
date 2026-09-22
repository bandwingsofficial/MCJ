"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { CourseModuleStatusBadge } from "@/src/features/course-modules/components/CourseModuleStatusBadge";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import { formatModuleOrderLabel } from "@/src/features/course-lessons/utils/lesson-order.utils";
import {
  courseManageTabPath,
  courseManagePath,
} from "@/src/features/courses/utils/course-manage.routes";

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
  const modulesTabHref = courseManageTabPath(courseId, "modules");

  return (
    <>
      <Link
        href={modulesTabHref}
        className="inline-flex items-center text-sm font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Back to Modules
      </Link>

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
        <Link
          href={modulesTabHref}
          className="font-medium text-[#647A9B] transition-colors hover:text-[#2563EB]"
        >
          Modules
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
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
