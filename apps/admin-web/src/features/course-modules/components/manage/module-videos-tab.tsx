"use client";

import { useMemo, useState } from "react";

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
import { ModuleContentSection } from "@/src/features/course-modules/components/manage/module-content-section";
import {
  matchesArchivedFilter,
  ModuleContentPagination,
  paginateRows,
} from "@/src/features/course-modules/components/manage/module-content-pagination";
import { ModuleContentStatusBadge } from "@/src/features/course-modules/components/manage/module-content-status-badge";
import { ModuleContentTable } from "@/src/features/course-modules/components/manage/module-content-table";
import { ModuleVideoForm } from "@/src/features/course-modules/components/manage/module-video-form";
import {
  filterChildSelfPacedVideoLessons,
  filterSelfPacedVideoLessons,
} from "@/src/features/course-modules/hooks/use-module-content-data";
import { formatDurationHms } from "@/src/features/course-modules/utils/module-content.utils";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface VideoRow extends CourseLesson {
  isArchived: boolean;
}

interface Props {
  moduleId: string;
  parentLessonId?: string;
  lessons: CourseLesson[];
  quizLessonIds: Set<string>;
  onRefresh: () => Promise<void>;
}

export function ModuleVideosTab({
  moduleId,
  parentLessonId,
  lessons,
  quizLessonIds,
  onRefresh,
}: Props) {
  const { createCourseLesson, isLoading: isCreating } = useCreateCourseLesson();
  const { updateCourseLesson, isLoading: isUpdating } = useUpdateCourseLesson();
  const { deleteCourseLesson, isLoading: isDeleting } = useDeleteCourseLesson();
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

  const sourceRows = useMemo(() => {
    const sourceLessons = parentLessonId
      ? filterChildSelfPacedVideoLessons(lessons, parentLessonId, quizLessonIds)
      : filterSelfPacedVideoLessons(lessons, quizLessonIds);

    return sourceLessons
      .map((lesson) => ({
        ...lesson,
        isArchived: Boolean(lesson.isDeleted || lesson.deletedAt),
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [lessons, quizLessonIds, parentLessonId]);

  const filteredRows = useMemo(() => {
    return sourceRows.filter((lesson) => {
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
    });
  }, [sourceRows, search, status]);

  const pagedRows = paginateRows(filteredRows, page, pageSize);
  const orderOffset = (page - 1) * pageSize;
  const reorderDisabled = Boolean(search.trim()) || status !== "ALL";

  return (
    <>
      <ModuleContentSection
        title="Self-Paced Videos"
        search={search}
        searchPlaceholder="Search self-paced videos..."
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        actionLabel="Add Self-Paced Video"
        onAction={() => {
          setSelected(null);
          setFormOpen(true);
        }}
      >
        <ModuleContentTable<VideoRow>
          rows={pagedRows}
          sourceCount={sourceRows.length}
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
                <div>
                  <p className="font-medium text-slate-900">{row.title}</p>
                  {row.description?.trim() ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                      {row.description}
                    </p>
                  ) : null}
                </div>
              ),
            },
            {
              key: "videoType",
              header: "Video Type",
              render: () => (
                <span className="text-sm text-slate-700">Self-Paced</span>
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
          emptyTitle="No self-paced videos found"
          emptyDescription="Create a self-paced video for this lesson."
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

        <div className="border-t border-slate-100 px-4 py-3">
          <ModuleContentPagination
            page={page}
            pageSize={pageSize}
            total={filteredRows.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </ModuleContentSection>

      <ModuleVideoForm
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
                contentType: "SELF_PACED_VIDEO",
              });
              appToast.success("Self-paced video updated successfully");
            } else {
              await createCourseLesson({
                moduleId,
                parentLessonId: parentLessonId ?? null,
                title: values.title,
                description: values.description,
                videoUrl: values.videoUrl,
                duration: values.duration,
                contentType: "SELF_PACED_VIDEO",
              });
              appToast.success("Self-paced video created successfully");
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
        contentLabel="Self-Paced Video"
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
            appToast.success("Self-paced video permanently deleted");
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
            ? "Activate Self-Paced Video"
            : "Deactivate Self-Paced Video"
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
              appToast.success("Self-paced video activated successfully");
            } else {
              await deactivateCourseLesson(selected.id);
              appToast.success("Self-paced video deactivated successfully");
            }
            setStatusOpen(false);
            setSelected(null);
            await onRefresh();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
      />
    </>
  );
}
