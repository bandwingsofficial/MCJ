"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { GripVertical } from "lucide-react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

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
}

function canReorder(course: CourseListItem): boolean {
  return (
    !isArchivedCourse(course) &&
    course.status === "ACTIVE" &&
    course.displayOrder != null
  );
}

function formatDuration(course: CourseListItem): string {
  if (course.duration == null) {
    return "—";
  }

  const unit = course.durationType
    ? course.durationType.toLowerCase()
    : "";

  return unit
    ? `${course.duration} ${unit}`
    : String(course.duration);
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

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

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
    <Table className="rounded-none border-0">
      <TableHeader>
        <TableRow>
          {selectionEnabled ? (
            <TableHead className="w-10">
              <input
                ref={selectAllRef}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={allVisibleSelected}
                disabled={selectionDisabled}
                onChange={(event) => {
                  toggleAllVisible(event.target.checked);
                }}
                aria-label="Select all courses on this page"
              />
            </TableHead>
          ) : null}

          <TableHead className="w-10">
            <span className="sr-only">Reorder</span>
          </TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((course) => {
          const draggable =
            canReorder(course) && !dragDisabled;

          return (
            <TableRow
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
              className={`${
                dropTargetId === course.id ? "bg-slate-50" : ""
              } ${dragId === course.id ? "opacity-60" : ""}`}
            >
              {selectionEnabled ? (
                <TableCell className="w-10">
                  <Checkbox
                    checked={safeSelectedIds.includes(course.id)}
                    disabled={selectionDisabled}
                    onCheckedChange={(checked) => {
                      toggleRow(course.id, checked);
                    }}
                  />
                </TableCell>
              ) : null}

              <TableCell className="w-10">
                {draggable ? (
                  <GripVertical
                    className="h-3.5 w-3.5 cursor-grab text-slate-400"
                    aria-label="Drag to reorder"
                  />
                ) : (
                  <span className="inline-block w-3.5" />
                )}
              </TableCell>

              <TableCell className="font-mono text-sm text-slate-700">
                {course.code ?? course.slug}
              </TableCell>

              <TableCell className="text-[15px] font-medium text-slate-900">
                <Link
                  href={`/courses/${course.id}/manage`}
                  className="hover:text-[#2447A8] hover:underline"
                >
                  {course.title}
                </Link>
                {course.tagline ? (
                  <div className="text-xs font-normal text-slate-500">
                    {course.tagline}
                  </div>
                ) : null}
              </TableCell>

              <TableCell>
                {getCourseCategoryDisplayName(course)}
              </TableCell>

              <TableCell>
                {course.level.replaceAll("_", " ")}
              </TableCell>

              <TableCell>{formatDuration(course)}</TableCell>

              <TableCell>
                <CourseStatusBadge
                  status={course.status}
                  deletedAt={course.deletedAt}
                  isDeleted={course.isDeleted}
                />
              </TableCell>

              <TableCell className="text-right">
                <CourseActions
                  course={course}
                  disabled={actionsDisabled || isSavingOrder}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
