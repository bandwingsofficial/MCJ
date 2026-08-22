"use client";

import Link from "next/link";
import {
  CircleCheck,
  Eye,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { CourseDetails } from "@/src/features/courses/types/course.types";
import { CourseStatusBadge } from "@/src/features/courses/components/course-status-badge";

interface Props {
  course: CourseDetails;
  categoryName?: string | null;
  activeSection?: string;
  onEdit: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  actionsDisabled?: boolean;
}

export function CourseManageHeader({
  course,
  categoryName,
  activeSection,
  onEdit,
  onActivate,
  onDeactivate,
  onArchive,
  onRestore,
  onPermanentDelete,
  actionsDisabled = false,
}: Props) {
  const isArchived = Boolean(course.deletedAt || course.isDeleted);
  const meta = [course.code ?? course.slug, categoryName].filter(Boolean).join(" · ");

  return (
    <div className="space-y-3">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link
          href="/courses"
          className="font-medium text-[#2447A8] hover:underline"
        >
          Courses
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-slate-700">
          {course.title} ({course.code ?? course.slug})
        </span>
        <span aria-hidden>›</span>
        <span className="text-slate-900">Management</span>
        {activeSection ? (
          <>
            <span aria-hidden>›</span>
            <span className="font-medium text-slate-700">
              {activeSection}
            </span>
          </>
        ) : null}
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {course.title}
          </h1>
          {meta ? (
            <p className="mt-1 text-sm text-slate-500">{meta}</p>
          ) : null}
          {course.shortDescription?.trim() ||
          course.tagline?.trim() ? (
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              {course.shortDescription?.trim() || course.tagline?.trim()}
            </p>
          ) : null}
          <div className="mt-2">
            <CourseStatusBadge
              status={course.status}
              deletedAt={course.deletedAt}
              isDeleted={course.isDeleted}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isArchived ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={actionsDisabled}
                onClick={onRestore}
                className="border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Restore
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                disabled={actionsDisabled}
                onClick={onPermanentDelete}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Permanently Delete
              </Button>
            </>
          ) : (
            <>
              <Link
                href={`/courses/${course.id}/preview`}
                className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Preview Course
              </Link>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={actionsDisabled}
                onClick={onEdit}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit Course
              </Button>

              {course.status === "ACTIVE" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={actionsDisabled}
                  onClick={onDeactivate}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Power className="mr-1.5 h-3.5 w-3.5" />
                  Deactivate
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={actionsDisabled}
                  onClick={onActivate}
                  className="border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                >
                  <CircleCheck className="mr-1.5 h-3.5 w-3.5" />
                  Activate
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={actionsDisabled}
                onClick={onArchive}
                className="border-amber-200 text-amber-800 hover:bg-amber-50"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
