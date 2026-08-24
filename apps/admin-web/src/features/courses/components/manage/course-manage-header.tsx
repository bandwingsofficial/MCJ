"use client";

import Link from "next/link";
import { Archive, Eye, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { CourseDetails } from "@/src/features/courses/types/course.types";
import { CourseStatusBadge } from "@/src/features/courses/components/course-status-badge";
import { coursePreviewPath } from "@/src/features/courses/utils/course-manage.routes";

interface Props {
  course: CourseDetails;
  categoryName?: string | null;
  activeSection?: string;
  onArchive: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  actionsDisabled?: boolean;
}

export function CourseManageHeader({
  course,
  categoryName,
  activeSection,
  onArchive,
  onRestore,
  onPermanentDelete,
  actionsDisabled = false,
}: Props) {
  const isArchived = Boolean(course.deletedAt || course.isDeleted);
  const meta = [course.code ?? course.slug, categoryName]
    .filter(Boolean)
    .join(" · ");

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

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <Link
            href={coursePreviewPath(course.id)}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Eye className="mr-1.5 h-4 w-4 shrink-0" />
            Preview Course
          </Link>

          {isArchived ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={actionsDisabled}
                onClick={onRestore}
                className="h-9 justify-center border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              >
                <RotateCcw className="mr-1.5 h-4 w-4 shrink-0" />
                Restore
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                disabled={actionsDisabled}
                onClick={onPermanentDelete}
                className="h-9 justify-center"
              >
                <Trash2 className="mr-1.5 h-4 w-4 shrink-0" />
                Permanently Delete
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={actionsDisabled}
              onClick={onArchive}
              className="h-9 justify-center border-amber-200 text-amber-800 hover:bg-amber-50"
            >
              <Archive className="mr-1.5 h-4 w-4 shrink-0" />
              Archive Course
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
