"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { appToast } from "@/src/shared/components/ui/toast";

import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
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
import { ModuleLessonForm } from "@/src/features/course-modules/components/manage/module-lesson-form";
import { paginateRows } from "@/src/features/course-modules/components/manage/module-content-pagination";
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

  const sourceRows = useMemo(
    () =>
      filterNormalLessons(
        lessons,
        quizLessonIds,
        resourceShellLessonIds,
      ).filter((lesson) => !lesson.isDeleted),
    [lessons, quizLessonIds, resourceShellLessonIds],
  );

  const filteredRows = useMemo(() => {
    return sourceRows
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
  }, [sourceRows, search, previewFilter]);

  const pagedRows = paginateRows(filteredRows, page, pageSize);
  const orderOffset = (page - 1) * pageSize;
  const reorderDisabled =
    Boolean(search.trim()) || previewFilter !== "ALL";
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const from = filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, filteredRows.length);

  return (
    <Card className="overflow-hidden rounded-xl border-[#E1EBF5] p-0 shadow-sm">
      <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-base font-semibold text-[#102A56]">Lessons</h2>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
            <div className="w-full sm:w-[240px]">
              <SearchInput
                value={search}
                placeholder="Search lessons..."
                className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
              />
            </div>

            <div className="w-full sm:w-[160px]">
              <AppSelect
                value={previewFilter}
                triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                onValueChange={(value) => {
                  setPreviewFilter(value);
                  setPage(1);
                }}
                options={LESSON_PREVIEW_FILTER_OPTIONS}
              />
            </div>

            <Button
              type="button"
              size="sm"
              className="h-9 shrink-0 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-4 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] hover:from-[#0284C7] hover:to-[#1D4ED8]"
              onClick={() => {
                setSelected(null);
                setFormOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Lesson
            </Button>
          </div>
        </div>
      </div>

      <ModuleContentTable<CourseLesson>
        variant="management"
        rows={pagedRows}
        orderOffset={orderOffset}
        sourceCount={sourceRows.length}
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
                <p className="text-sm font-medium text-[#102A56]">{row.title}</p>
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
        emptyTitle="No Lessons Found"
        emptyDescription="Create your first lesson for this module."
        emptySearchDescription="Create your first lesson or adjust your filters."
        renderActions={(row) => (
          <LessonTableActions
            isPreview={row.isPreview}
            disabled={isTogglingPreview && togglingLessonId === row.id}
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

      {filteredRows.length > 0 ? (
        <div className="flex flex-col gap-1.5 border-t border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647A9B] sm:text-sm">
            <span>
              Showing {from}–{to} of {filteredRows.length}
            </span>

            <label className="flex items-center gap-1.5">
              <span className="whitespace-nowrap">Rows per page</span>
              <select
                className="h-7 rounded-md border border-[#DCE8F5] bg-white px-1.5 text-xs text-[#102A56] sm:text-sm"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <CategoryPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      ) : null}

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
