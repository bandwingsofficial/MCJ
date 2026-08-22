"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { CourseLessonDeleteDialog } from "@/src/features/course-lessons/components";
import {
  useCreateCourseLesson,
  useUpdateCourseLesson,
  useDeleteCourseLesson,
  useDeactivateCourseLesson,
  useActivateCourseLesson,
  useMoveCourseLesson,
} from "@/src/features/course-lessons/hooks";
import type { CourseLesson } from "@/src/features/course-lessons/types";
import { ModuleContentActions } from "@/src/features/course-modules/components/manage/module-content-actions";
import { ModuleContentFilters } from "@/src/features/course-modules/components/manage/module-content-filters";
import { ModuleLiveRecordedVideoForm } from "@/src/features/course-modules/components/manage/module-live-recorded-video-form";
import {
  matchesArchivedFilter,
  ModuleContentPagination,
  paginateRows,
} from "@/src/features/course-modules/components/manage/module-content-pagination";
import { ModuleContentStatusBadge } from "@/src/features/course-modules/components/manage/module-content-status-badge";
import { ModuleContentTable } from "@/src/features/course-modules/components/manage/module-content-table";
import { filterLiveRecordedVideoLessons } from "@/src/features/course-modules/hooks/use-module-content-data";
import { formatDurationHms } from "@/src/features/course-modules/utils/module-content.utils";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface VideoRow extends CourseLesson {
  isArchived: boolean;
}

interface Props {
  moduleId: string;
  lessons: CourseLesson[];
  quizLessonIds: Set<string>;
  onRefresh: () => Promise<void>;
}

export function ModuleLiveRecordedVideosTab({
  moduleId,
  lessons,
  quizLessonIds,
  onRefresh,
}: Props) {
  const { createCourseLesson, isLoading: isCreating } =
    useCreateCourseLesson();
  const { updateCourseLesson, isLoading: isUpdating } =
    useUpdateCourseLesson();
  const { deleteCourseLesson, isLoading: isDeleting } =
    useDeleteCourseLesson();
  const { deactivateCourseLesson, isLoading: isDeactivating } =
    useDeactivateCourseLesson();
  const { activateCourseLesson, isLoading: isActivating } =
    useActivateCourseLesson();
  const { moveCourseLesson } = useMoveCourseLesson();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selected, setSelected] = useState<CourseLesson | null>(null);

  const filteredRows = useMemo(() => {
    return filterLiveRecordedVideoLessons(lessons, quizLessonIds)
      .map((lesson) => ({
        ...lesson,
        isArchived: Boolean(lesson.isDeleted || lesson.deletedAt),
      }))
      .filter((lesson) => {
        if (!matchesArchivedFilter(lesson.isArchived, status)) {
          return false;
        }
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
  }, [lessons, quizLessonIds, search, status]);

  const pagedRows = paginateRows(filteredRows, page, pageSize);
  const orderOffset = (page - 1) * pageSize;
  const reorderDisabled = Boolean(search.trim()) || status !== "ALL";

  return (
    <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Live Recorded Videos
        </h2>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setSelected(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Live Recorded Video
        </Button>
      </div>

      <ModuleContentFilters
        search={search}
        status={status}
        searchPlaceholder="Search live recorded videos..."
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
      />

      <ModuleContentTable<VideoRow>
        rows={pagedRows}
        orderOffset={orderOffset}
        reorderDisabled={reorderDisabled}
        onReorder={async ({ rowId, newPosition }) => {
          await moveCourseLesson(rowId, newPosition);
          await onRefresh();
          appToast.success("Video order updated successfully");
        }}
        columns={[
          {
            key: "title",
            header: "Title",
            render: (row) => (
              <p className="font-medium text-slate-900">{row.title}</p>
            ),
          },
          {
            key: "description",
            header: "Description",
            render: (row) => (
              <p className="line-clamp-2 text-sm text-slate-600">
                {row.description?.trim() || "—"}
              </p>
            ),
          },
          {
            key: "duration",
            header: "Duration",
            render: (row) => (
              <span className="text-sm text-slate-700">
                {formatDurationHms(row.duration)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <ModuleContentStatusBadge isArchived={row.isArchived} />
            ),
          },
        ]}
        emptyTitle="No live recorded videos yet"
        emptyDescription="Add a recorded session to this module."
        renderActions={(row) => (
          <ModuleContentActions
            isArchived={row.isArchived}
            onDeactivate={() => {
              setSelected(row);
              setStatusOpen(true);
            }}
            onActivate={() => {
              setSelected(row);
              setStatusOpen(true);
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

      <ModuleLiveRecordedVideoForm
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
              await updateCourseLesson(selected.id, {
                ...values,
                contentType: "LIVE_RECORDED_VIDEO",
              });
              appToast.success("Live recorded video updated successfully");
            } else {
              await createCourseLesson({
                moduleId,
                title: values.title,
                description: values.description,
                videoUrl: values.videoUrl,
                duration: values.duration,
                contentType: "LIVE_RECORDED_VIDEO",
              });
              appToast.success("Live recorded video created successfully");
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
        contentLabel="Live Recorded Video"
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
            appToast.success("Live recorded video permanently deleted");
            setDeleteOpen(false);
            setSelected(null);
            await onRefresh();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
      />

      <ConfirmDialog
        open={statusOpen}
        title={
          selected?.isDeleted
            ? "Activate Live Recorded Video"
            : "Deactivate Live Recorded Video"
        }
        description={`Are you sure you want to ${
          selected?.isDeleted ? "activate" : "deactivate"
        } "${selected?.title ?? ""}"?`}
        loading={isActivating || isDeactivating}
        confirmLabel={selected?.isDeleted ? "Activate" : "Deactivate"}
        onCancel={() => {
          setStatusOpen(false);
          setSelected(null);
        }}
        onConfirm={async () => {
          if (!selected) {
            return;
          }
          try {
            if (selected.isDeleted) {
              await activateCourseLesson(selected.id);
              appToast.success("Live recorded video activated successfully");
            } else {
              await deactivateCourseLesson(selected.id);
              appToast.success("Live recorded video deactivated successfully");
            }
            setStatusOpen(false);
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
