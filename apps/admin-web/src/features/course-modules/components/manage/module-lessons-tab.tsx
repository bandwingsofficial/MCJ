"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { appToast } from "@/src/shared/components/ui/toast";

import { CourseLessonDeleteDialog } from "@/src/features/course-lessons/components";
import {
  LESSON_PREVIEW_FILTER_OPTIONS,
  LessonPreviewAccessBadge,
  matchesPreviewAccessFilter,
} from "@/src/features/course-lessons/components/lesson-preview-access-badge";
import { LessonTableActions } from "@/src/features/course-lessons/components/lesson-table-actions";
import {
  useCreateCourseLesson,
  useUpdateCourseLesson,
  useDeleteCourseLesson,
  useMoveCourseLesson,
  useSetLessonPreview,
} from "@/src/features/course-lessons/hooks";
import type { CourseLesson } from "@/src/features/course-lessons/types";
import { ModuleContentFilters } from "@/src/features/course-modules/components/manage/module-content-filters";
import { ModuleLessonForm } from "@/src/features/course-modules/components/manage/module-lesson-form";
import {
  ModuleContentPagination,
  paginateRows,
} from "@/src/features/course-modules/components/manage/module-content-pagination";
import { ModuleContentTable } from "@/src/features/course-modules/components/manage/module-content-table";
import { filterNormalLessons } from "@/src/features/course-modules/hooks/use-module-content-data";
import { courseManageLessonPath } from "@/src/features/courses/utils/course-manage.routes";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface Props {
  courseId: string;
  moduleId: string;
  lessons: CourseLesson[];
  quizLessonIds: Set<string>;
  resourceShellLessonIds: Set<string>;
  onRefresh: () => Promise<void>;
}

export function ModuleLessonsTab({
  courseId,
  moduleId,
  lessons,
  quizLessonIds,
  resourceShellLessonIds,
  onRefresh,
}: Props) {
  const router = useRouter();
  const { createCourseLesson, isLoading: isCreating } =
    useCreateCourseLesson();
  const { updateCourseLesson, isLoading: isUpdating } =
    useUpdateCourseLesson();
  const { deleteCourseLesson, isLoading: isDeleting } =
    useDeleteCourseLesson();
  const { moveCourseLesson } = useMoveCourseLesson();
  const { setLessonPreview, isLoading: isTogglingPreview } =
    useSetLessonPreview();

  const [search, setSearch] = useState("");
  const [previewFilter, setPreviewFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<CourseLesson | null>(null);
  const [togglingLessonId, setTogglingLessonId] = useState<string | null>(
    null,
  );

  const filteredRows = useMemo(() => {
    return filterNormalLessons(
      lessons,
      quizLessonIds,
      resourceShellLessonIds,
    )
      .filter((lesson) => !lesson.isDeleted)
      .filter((lesson) =>
        matchesPreviewAccessFilter(lesson.isPreview, previewFilter),
      )
      .filter((lesson) => {
        if (!search.trim()) {
          return true;
        }
        const query = search.toLowerCase();
        return (
          lesson.title.toLowerCase().includes(query) ||
          (lesson.description ?? "").toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [
    lessons,
    quizLessonIds,
    resourceShellLessonIds,
    search,
    previewFilter,
  ]);

  const pagedRows = paginateRows(filteredRows, page, pageSize);
  const orderOffset = (page - 1) * pageSize;
  const reorderDisabled =
    Boolean(search.trim()) || previewFilter !== "ALL";

  return (
    <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-[#102A56]">Lessons</h2>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setSelected(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Lesson
        </Button>
      </div>

      <ModuleContentFilters
        search={search}
        status={previewFilter}
        searchPlaceholder="Search lessons..."
        statusOptions={LESSON_PREVIEW_FILTER_OPTIONS}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setPreviewFilter(value);
          setPage(1);
        }}
      />

      <ModuleContentTable<CourseLesson>
        rows={pagedRows}
        orderOffset={orderOffset}
        reorderDisabled={reorderDisabled}
        onReorder={async ({ rowId, newPosition }) => {
          await moveCourseLesson(rowId, newPosition);
          await onRefresh();
          appToast.success("Lesson order updated successfully");
        }}
        columns={[
          {
            key: "title",
            header: "Lesson",
            render: (row) => (
              <div>
                <p className="font-medium text-[#102A56]">{row.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                  {row.description?.trim() || "—"}
                </p>
              </div>
            ),
          },
          {
            key: "previewAccess",
            header: "Preview Access",
            render: (row) => (
              <LessonPreviewAccessBadge isPreview={row.isPreview} />
            ),
          },
        ]}
        emptyTitle="No lessons yet"
        emptyDescription="Create your first lesson for this module."
        renderActions={(row) => (
          <LessonTableActions
            isPreview={row.isPreview}
            disabled={
              isTogglingPreview && togglingLessonId === row.id
            }
            onTogglePreview={async () => {
              setTogglingLessonId(row.id);
              try {
                const nextPreview = !row.isPreview;
                await setLessonPreview(row.id, nextPreview);
                await onRefresh();
                appToast.success(
                  nextPreview
                    ? "Lesson unlocked for free preview"
                    : "Lesson locked from free preview",
                );
              } catch (error) {
                appToast.error(getErrorMessage(error));
              } finally {
                setTogglingLessonId(null);
              }
            }}
            onManage={() => {
              router.push(
                courseManageLessonPath(courseId, moduleId, row.id),
              );
            }}
            onEdit={() => {
              setSelected(row);
              setFormOpen(true);
            }}
            onDelete={() => {
              setSelected(row);
              setDeleteOpen(true);
            }}
          />
        )}
      />

      <ModuleContentPagination
        page={page}
        pageSize={pageSize}
        total={filteredRows.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <ModuleLessonForm
        open={formOpen}
        loading={isCreating || isUpdating}
        lesson={selected ?? undefined}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        onSubmit={async (values) => {
          try {
            if (selected) {
              await updateCourseLesson(selected.id, values);
              appToast.success("Lesson updated successfully");
            } else {
              await createCourseLesson({
                moduleId,
                parentLessonId: null,
                title: values.title,
                description: values.description,
                videoUrl: "",
                contentType: "LESSON",
              });
              appToast.success("Lesson created successfully");
            }
            setFormOpen(false);
            setSelected(null);
            await onRefresh();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
      />

      <CourseLessonDeleteDialog
        open={deleteOpen}
        loading={isDeleting}
        lessonTitle={selected?.title}
        onClose={() => {
          setDeleteOpen(false);
          setSelected(null);
        }}
        onConfirm={async () => {
          if (!selected) {
            return;
          }
          try {
            await deleteCourseLesson(selected.id);
            appToast.success("Lesson deleted successfully");
            setDeleteOpen(false);
            setSelected(null);
            await onRefresh();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
      />
    </Card>
  );
}
