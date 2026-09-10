"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { GripVertical } from "lucide-react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";

import type { CourseListItem } from "@/src/features/courses/types/course.types";
import { getCourseCategoryDisplayName } from "@/src/features/courses/utils/course-category.utils";
import { isArchivedCourse } from "@/src/features/courses/utils/course-bulk.utils";

import { CourseStatusBadge } from "./course-status-badge";
import { CourseActions } from "./course-actions";

interface CourseTableProps {
  courses: CourseListItem[];
  selectedCourseIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionsDisabled?: boolean;
  selectionDisabled?: boolean;
  reorderDisabled?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onReorder: (payload: {
    courseId: string;
    newDisplayOrder: number;
  }) => Promise<void>;
  onActivate: (course: CourseListItem) => void;
  onDeactivate: (course: CourseListItem) => void;
  onEdit: (course: CourseListItem) => void;
}

function canReorder(course: CourseListItem): boolean {
  return (
    !isArchivedCourse(course) &&
    course.status === "ACTIVE" &&
    course.displayOrder != null
  );
}

function resolveCourseLevel(course: CourseListItem): string {
  return course.level.replaceAll("_", " ").toLowerCase();
}

export function CourseTable({
  courses,
  selectedCourseIds = [],
  onSelectionChange,
  actionsDisabled = false,
  selectionDisabled = false,
  reorderDisabled = false,
  emptyTitle = "No Courses Found",
  emptyDescription = "Create your first course to get started.",
  onReorder,
  onActivate,
  onDeactivate,
  onEdit,
}: CourseTableProps) {
  const [rows, setRows] = useState(courses);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<
    string | null
  >(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const reorderInFlightRef = useRef(false);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const safeSelectedIds = selectedCourseIds ?? [];
  const selectionEnabled = Boolean(onSelectionChange);
  const visibleIds = rows.map((course) => course.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    safeSelectedIds.includes(id)
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 &&
    selectedVisibleCount === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  const columnCount = selectionEnabled ? 9 : 8;

  useEffect(() => {
    setRows(courses);
  }, [courses]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const toggleRow = (courseId: string, checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) {
      return;
    }

    const next = checked
      ? Array.from(new Set([...safeSelectedIds, courseId]))
      : safeSelectedIds.filter((id) => id !== courseId);

    onSelectionChange(next);
  };

  const toggleAllVisible = (checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) {
      return;
    }

    if (!checked) {
      onSelectionChange(
        safeSelectedIds.filter((id) => !visibleIds.includes(id))
      );
      return;
    }

    onSelectionChange(
      Array.from(new Set([...safeSelectedIds, ...visibleIds]))
    );
  };

  const handleDrop = async (targetId: string) => {
    if (
      !dragId ||
      dragId === targetId ||
      isSavingOrder ||
      reorderDisabled ||
      reorderInFlightRef.current ||
      safeSelectedIds.length > 0
    ) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const previous = rows;
    const next = [...rows];
    const fromIndex = next.findIndex((item) => item.id === dragId);
    const toIndex = next.findIndex((item) => item.id === targetId);

    if (fromIndex < 0 || toIndex < 0) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const source = next[fromIndex];
    const target = next[toIndex];

    if (
      !canReorder(source) ||
      !canReorder(target) ||
      target.displayOrder == null
    ) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const newDisplayOrder = target.displayOrder;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setRows(next);

    try {
      reorderInFlightRef.current = true;
      setIsSavingOrder(true);
      await onReorder({
        courseId: source.id,
        newDisplayOrder,
      });
    } catch {
      setRows(previous);
    } finally {
      reorderInFlightRef.current = false;
      setIsSavingOrder(false);
      setDragId(null);
      setDropTargetId(null);
    }
  };

  const dragDisabled =
    reorderDisabled ||
    isSavingOrder ||
    safeSelectedIds.length > 0;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            {selectionEnabled ? (
              <th className="w-9 !px-6 !py-4 text-left">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300"
                  checked={allVisibleSelected}
                  disabled={selectionDisabled}
                  onChange={(event) => {
                    toggleAllVisible(event.target.checked);
                  }}
                  aria-label="Select all courses on this page"
                />
              </th>
            ) : null}

            <th className="w-8 !px-4 !py-4">
              <span className="sr-only">Reorder</span>
            </th>
            <th className="w-12 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Image
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Code
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Name
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Category
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Level
            </th>
            <th className="w-24 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Status
            </th>
            <th className="w-[6.75rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columnCount}
                className="!px-4 !py-4 align-middle"
              >
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                  <h3 className="text-base font-semibold">
                    No Courses Found
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    Create your first course or adjust your filters.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((course) => {
            const draggable =
              canReorder(course) && !dragDisabled;
            const isArchived = isArchivedCourse(course);

            return (
              <tr
                key={course.id}
                draggable={draggable}
                onDragStart={() => {
                  if (!draggable) {
                    return;
                  }
                  setDragId(course.id);
                }}
                onDragOver={(event) => {
                  if (!draggable || !dragId) {
                    return;
                  }
                  event.preventDefault();
                  setDropTargetId(course.id);
                }}
                onDragLeave={() => {
                  if (dropTargetId === course.id) {
                    setDropTargetId(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  void handleDrop(course.id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setDropTargetId(null);
                }}
                className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                  dropTargetId === course.id ? "bg-blue-50/60" : ""
                } ${dragId === course.id ? "opacity-60" : ""} ${
                  isArchived ? "bg-slate-50/40" : "bg-white"
                }`}
              >
                {selectionEnabled ? (
                  <td className="w-9 !px-6 !py-4 align-middle">
                    <Checkbox
                      checked={safeSelectedIds.includes(course.id)}
                      disabled={selectionDisabled}
                      onCheckedChange={(checked) => {
                        toggleRow(course.id, Boolean(checked));
                      }}
                    />
                  </td>
                ) : null}

                <td className="w-8 !px-4 !py-4 align-middle">
                  {draggable ? (
                    <GripVertical className="h-3.5 w-3.5 cursor-grab text-slate-400 active:cursor-grabbing" />
                  ) : (
                    <span className="inline-block w-3.5" />
                  )}
                </td>

                <td className="w-12 !px-4 !py-4 align-middle">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-md border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-[9px] font-medium uppercase tracking-wide text-slate-400">
                      N/A
                    </div>
                  )}
                </td>

                <td className="!px-4 !py-4 align-middle font-mono text-sm text-slate-700">
                  {course.code ?? course.slug}
                </td>

                <td className="!px-4 !py-4 align-middle">
                  <Link
                    href={`/courses/${course.id}/manage`}
                    className="text-sm font-medium leading-snug text-[#102A56] hover:text-[#2563EB] hover:underline"
                  >
                    {course.title}
                  </Link>
                  {course.tagline ? (
                    <div className="text-xs font-normal text-slate-500">
                      {course.tagline}
                    </div>
                  ) : null}
                </td>

                <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                  {getCourseCategoryDisplayName(course)}
                </td>

                <td className="!px-4 !py-4 align-middle text-sm capitalize text-slate-700">
                  {resolveCourseLevel(course)}
                </td>

                <td className="!px-4 !py-4 align-middle">
                  <CourseStatusBadge
                    status={course.status}
                    deletedAt={course.deletedAt}
                    isDeleted={course.isDeleted}
                  />
                </td>

                <td className="!px-8 !py-4 align-middle">
                  <CourseActions
                    course={course}
                    disabled={actionsDisabled || isSavingOrder}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                    onEdit={onEdit}
                  />
                </td>
              </tr>
            );
          })
          )}
        </tbody>
      </table>
    </div>
  );
}
