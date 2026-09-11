"use client";

import Image from "next/image";
import Link from "next/link";
import { Archive, ChevronRight, Eye, RotateCcw, Trash2 } from "lucide-react";

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
  const description =
    course.shortDescription?.trim() ||
    course.tagline?.trim() ||
    course.description?.trim() ||
    null;

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
        <span className="font-medium text-slate-700">
          {course.title} ({course.code ?? course.slug})
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-[#102A56]">Management</span>
        {activeSection ? (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span className="font-medium text-slate-700">{activeSection}</span>
          </>
        ) : null}
      </nav>

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="shrink-0">
              {course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-xl border border-[#DCE8F5] object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-[#DCE8F5] bg-gradient-to-br from-slate-50 to-[#F8FBFF] text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  No Image
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-2">
                <h1 className="min-w-0 text-xl font-bold tracking-tight text-[#102A56] sm:text-2xl">
                  {course.title}
                </h1>
                <CourseStatusBadge
                  status={course.status}
                  deletedAt={course.deletedAt}
                  isDeleted={course.isDeleted}
                />
              </div>

              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Course Code
                  </dt>
                  <dd className="mt-0.5 font-mono text-sm font-medium text-[#102A56]">
                    {course.code ?? course.slug}
                  </dd>
                </div>
                <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Category
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#102A56]">
                    {categoryName || "—"}
                  </dd>
                </div>
              </dl>

              {description ? (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:min-w-[180px] lg:items-end">
            <Link
              href={coursePreviewPath(course.id)}
              className="inline-flex h-11 items-center justify-center rounded-lg border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] transition-all hover:from-[#0284C7] hover:to-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
            >
              <Eye className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
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
    </div>
  );
}
