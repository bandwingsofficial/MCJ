"use client";

import Link from "next/link";
import {
  Eye,
  MoreVertical,
  Pencil,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

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
  const meta = [course.slug, categoryName].filter(Boolean).join(" · ");

  const lifecycleItems = isArchived
    ? [
        {
          label: "Restore",
          onClick: onRestore,
        },
        {
          label: "Permanently Delete",
          onClick: onPermanentDelete,
          destructive: true,
        },
      ]
    : [
        ...(course.status === "ACTIVE"
          ? [
              {
                label: "Deactivate",
                onClick: onDeactivate,
              },
            ]
          : [
              {
                label: "Activate",
                onClick: onActivate,
              },
            ]),
        {
          label: "Archive",
          onClick: onArchive,
          destructive: true,
        },
      ];

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
          {course.title} ({course.slug})
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
          <div className="mt-2">
            <CourseStatusBadge
              status={course.status}
              deletedAt={course.deletedAt}
              isDeleted={course.isDeleted}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/courses/${course.id}/preview`}
            className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Preview Course
          </Link>

          {!isArchived ? (
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
          ) : null}

          <Dropdown
            trigger={
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={actionsDisabled}
                title="Course actions"
                aria-label="Course actions"
                className="h-9 w-9 px-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
            items={lifecycleItems}
          />
        </div>
      </div>
    </div>
  );
}
