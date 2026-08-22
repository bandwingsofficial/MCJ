"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import { CourseModuleForm } from "@/src/features/course-modules/components";
import { CourseModuleStatusBadge } from "@/src/features/course-modules/components/CourseModuleStatusBadge";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import { courseManagePath } from "@/src/features/courses/utils/course-manage.routes";

interface Props {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  module: CourseModule;
  editOpen: boolean;
  editLoading: boolean;
  onEditOpen: () => void;
  onEditClose: () => void;
  onEditSubmit: (values: {
    title: string;
    description: string;
    keySkills: string[];
  }) => Promise<void>;
}

function formatModuleNumber(order: number) {
  return `Module ${String(order).padStart(2, "0")}`;
}

export function ModuleManageHeader({
  courseId,
  courseTitle,
  courseCode,
  module,
  editOpen,
  editLoading,
  onEditOpen,
  onEditClose,
  onEditSubmit,
}: Props) {
  return (
    <>
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link
          href="/courses"
          className="font-medium text-[#2447A8] hover:underline"
        >
          Courses
        </Link>
        <span aria-hidden>›</span>
        <Link
          href={courseManagePath(courseId)}
          className="font-medium text-[#2447A8] hover:underline"
        >
          {courseTitle} ({courseCode})
        </Link>
        <span aria-hidden>›</span>
        <span className="text-slate-700">Management</span>
        <span aria-hidden>›</span>
        <Link
          href={courseManagePath(courseId)}
          className="font-medium text-[#2447A8] hover:underline"
        >
          Modules
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-slate-900">{module.title}</span>
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              {module.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {formatModuleNumber(module.displayOrder)}
            </p>
            {module.description ? (
              <p className="mt-2 text-sm text-slate-600">{module.description}</p>
            ) : null}
            <div className="mt-2">
              <CourseModuleStatusBadge module={module} />
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onEditOpen}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit Module
          </Button>
        </div>
      </div>

      <CourseModuleForm
        open={editOpen}
        loading={editLoading}
        module={module}
        courseId={courseId}
        onClose={onEditClose}
        onSubmit={async (values) => {
          await onEditSubmit({
            title: values.title,
            description: values.description,
            keySkills: values.keySkills,
          });
        }}
      />
    </>
  );
}
