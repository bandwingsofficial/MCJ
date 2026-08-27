"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";

import { CourseResourceDeleteDialog, CourseResourceForm } from "@/src/features/course-resources/components";
import {
  useCreateCourseResource,
  useDeleteCourseResource,
  useMoveCourseResource,
  usePermanentDeleteCourseResource,
  useRestoreCourseResource,
  useUpdateCourseResource,
} from "@/src/features/course-resources/hooks";
import type { CourseResourceFormValues } from "@/src/features/course-resources/types";
import { isResourceTypeLink } from "@/src/features/course-resources/utils/resource-file-validation";
import { useCreateCourseLesson } from "@/src/features/course-lessons/hooks";
import { useCreateCourseQuiz, useDeleteCourseQuiz, usePublishCourseQuiz } from "@/src/features/course-quizzes/hooks";
import { ModuleContentActions } from "@/src/features/course-modules/components/manage/module-content-actions";
import {
  matchesArchivedFilter,
  ModuleContentPagination,
  paginateRows,
} from "@/src/features/course-modules/components/manage/module-content-pagination";
import { ModuleContentStatusBadge } from "@/src/features/course-modules/components/manage/module-content-status-badge";
import { ModuleContentTable } from "@/src/features/course-modules/components/manage/module-content-table";
import type {
  ModuleQuizRow,
  ModuleResourceRow,
} from "@/src/features/course-modules/hooks/use-module-content-data";
import { ModuleContentSection } from "@/src/features/course-modules/components/manage/module-content-section";
import { formatResourceSize } from "@/src/features/course-modules/utils/module-content.utils";
import { courseManageLessonQuizPath } from "@/src/features/courses/utils/course-manage.routes";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface ResourceTableRow extends ModuleResourceRow {
  isArchived: boolean;
}

interface QuizTableRow extends ModuleQuizRow {
  id: string;
  displayOrder: number;
  isArchived: boolean;
}

interface ResourcesTabProps {
  moduleId: string;
  resources: ModuleResourceRow[];
  onRefresh: () => Promise<void>;
  lessonId?: string;
}

export function ModuleResourcesTab({
  moduleId,
  resources,
  onRefresh,
  lessonId,
}: ResourcesTabProps) {
  const { createCourseLesson } = useCreateCourseLesson();
  const { createCourseResource, isLoading: isCreating } =
    useCreateCourseResource();
  const { updateCourseResource, isLoading: isUpdating } =
    useUpdateCourseResource();
  const { deleteCourseResource } = useDeleteCourseResource();
  const {
    permanentDeleteCourseResource,
    isLoading: isPermanentlyDeleting,
  } = usePermanentDeleteCourseResource();
  const { restoreCourseResource } = useRestoreCourseResource();
  const { moveCourseResource } = useMoveCourseResource();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selected, setSelected] = useState<ModuleResourceRow | null>(null);

  const sourceRows = useMemo(() => {
    return resources
      .filter((resource) => !lessonId || resource.lessonId === lessonId)
      .map((resource) => ({
        ...resource,
        isArchived: Boolean(resource.isDeleted || resource.deletedAt),
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [resources, lessonId]);

  const filteredRows = useMemo(() => {
    return sourceRows.filter((resource) => {
      if (!matchesArchivedFilter(resource.isArchived, status)) {
        return false;
      }
      if (!search.trim()) {
        return true;
      }
      return resource.title.toLowerCase().includes(search.toLowerCase());
    });
  }, [sourceRows, search, status]);

  const pagedRows = paginateRows(filteredRows, page, pageSize);
  const orderOffset = (page - 1) * pageSize;

  return (
    <>
      <ModuleContentSection
        title="Resources"
        search={search}
        searchPlaceholder="Search resources..."
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        actionLabel="Add Resource"
        onAction={() => {
          setSelected(null);
          setFormOpen(true);
        }}
      >
        <ModuleContentTable<ResourceTableRow>
          rows={pagedRows}
          sourceCount={sourceRows.length}
          orderOffset={orderOffset}
          reorderDisabled={Boolean(search.trim()) || status !== "ALL"}
          onReorder={async ({ rowId, newPosition }) => {
            await moveCourseResource(rowId, { newPosition });
            await onRefresh();
            appToast.success("Resource order updated successfully");
          }}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (row) => (
                <p className="font-medium text-[#102A56]">{row.title}</p>
              ),
            },
            {
              key: "type",
              header: "Type",
              render: (row) => (
                <span className="text-sm text-slate-700">{row.type}</span>
              ),
            },
            {
              key: "fileSize",
              header: "File/Size",
              render: (row) => (
                <span className="text-sm text-slate-700">
                  {formatResourceSize(row)}
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
          emptyTitle="No resources found"
          emptyDescription="Add a resource to this lesson."
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

      <CourseResourceForm
        open={formOpen}
        loading={isCreating || isUpdating}
        lessonId={selected?.lessonId ?? lessonId ?? ""}
        resource={selected ?? undefined}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        onSubmit={async (values: CourseResourceFormValues, file: File | null) => {
          try {
            if (selected) {
              await updateCourseResource(
                selected.id,
                {
                  title: values.title,
                  type: values.type,
                  fileUrl: isResourceTypeLink(values.type)
                    ? values.fileUrl
                    : selected.fileUrl,
                },
                file,
              );
              appToast.success("Resource updated successfully");
            } else if (lessonId) {
              await createCourseResource(
                { ...values, lessonId },
                file,
              );
              appToast.success("Resource created successfully");
            } else {
              const lesson = await createCourseLesson({
                moduleId,
                title: values.title,
                description: "",
                videoUrl: "",
                contentType: "LESSON",
              });
              await createCourseResource(
                { ...values, lessonId: lesson.id },
                file,
              );
              appToast.success("Resource created successfully");
            }
            setFormOpen(false);
            setSelected(null);
            await onRefresh();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
      />

      <CourseResourceDeleteDialog
        open={deleteOpen}
        loading={isPermanentlyDeleting}
        resourceTitle={selected?.title}
        onClose={() => {
          setDeleteOpen(false);
          setSelected(null);
        }}
        onConfirm={async () => {
          if (!selected) {
            return;
          }
          try {
            await permanentDeleteCourseResource(selected.id);
            appToast.success("Resource permanently deleted");
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
        title={selected?.isDeleted ? "Activate Resource" : "Deactivate Resource"}
        description={`Are you sure you want to ${
          selected?.isDeleted ? "activate" : "deactivate"
        } "${selected?.title ?? ""}"?`}
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
              await restoreCourseResource(selected.id);
              appToast.success("Resource activated successfully");
            } else {
              await deleteCourseResource(selected.id);
              appToast.success("Resource deactivated successfully");
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

interface QuizzesTabProps {
  courseId: string;
  moduleId: string;
  quizzes: ModuleQuizRow[];
  onRefresh: () => Promise<void>;
  lessonId?: string;
}

export function ModuleQuizzesTab({
  courseId,
  moduleId,
  quizzes,
  onRefresh,
  lessonId,
}: QuizzesTabProps) {
  const router = useRouter();
  const { createCourseLesson } = useCreateCourseLesson();
  const { createCourseQuiz } = useCreateCourseQuiz();
  const { publishCourseQuiz } = usePublishCourseQuiz();
  const { deleteCourseQuiz, isLoading: isDeletingQuiz } = useDeleteCourseQuiz();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [quizFormOpen, setQuizFormOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<QuizTableRow | null>(null);

  const sourceRows = useMemo(() => {
    return quizzes
      .filter((row) => !lessonId || row.lessonId === lessonId)
      .map((row) => ({
        ...row,
        id: row.quiz.id,
        displayOrder: row.quiz.displayOrder,
        isArchived: Boolean(row.quiz.isDeleted || row.quiz.deletedAt),
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [quizzes, lessonId]);

  const filteredRows = useMemo(() => {
    return sourceRows.filter((row) => {
      if (status !== "ALL" && row.quiz.status !== status) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }
      return row.quiz.title.toLowerCase().includes(search.toLowerCase());
    });
  }, [sourceRows, search, status]);

  const pagedRows = paginateRows(filteredRows, page, pageSize);
  const orderOffset = (page - 1) * pageSize;

  return (
    <>
      <ModuleContentSection
        title="Quizzes"
        search={search}
        searchPlaceholder="Search quizzes..."
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        statusOptions={[
          { label: "All Status", value: "ALL" },
          { label: "Draft", value: "DRAFT" },
          { label: "Published", value: "PUBLISHED" },
        ]}
        actionLabel="Add Quiz"
        onAction={() => {
          setQuizTitle("");
          setQuizFormOpen(true);
        }}
      >
        <ModuleContentTable<QuizTableRow>
          rows={pagedRows}
          sourceCount={sourceRows.length}
          orderOffset={orderOffset}
          showReorderColumn={false}
          columns={[
            {
              key: "title",
              header: "Title",
              render: (row) => (
                <p className="font-medium text-[#102A56]">{row.quiz.title}</p>
              ),
            },
            {
              key: "questions",
              header: "Questions",
              render: (row) => (
                <span className="text-sm text-slate-700">
                  {row.questionCount} Question
                  {row.questionCount === 1 ? "" : "s"}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <Badge
                  variant={
                    row.quiz.status === "PUBLISHED" ? "success" : "default"
                  }
                >
                  {row.quiz.status === "PUBLISHED" ? "Published" : "Draft"}
                </Badge>
              ),
            },
          ]}
          emptyTitle="No quizzes found"
          emptyDescription="Create a quiz for this lesson."
          renderActions={(row) => (
            <ModuleContentActions
              isArchived={row.isArchived}
              showManage
              onManage={() => {
                router.push(
                  courseManageLessonQuizPath(courseId, moduleId, row.lessonId),
                );
              }}
              onActivate={
                row.quiz.status === "DRAFT"
                  ? () => {
                      setSelected(row);
                      setPublishOpen(true);
                    }
                  : undefined
              }
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

      <Modal
        open={quizFormOpen}
        title="Add Quiz"
        onClose={() => setQuizFormOpen(false)}
      >
        <div className="space-y-3">
          <div>
            <Label htmlFor="quiz-title">Quiz Name</Label>
            <Input
              id="quiz-title"
              value={quizTitle}
              onChange={(event) => setQuizTitle(event.target.value)}
              placeholder="e.g. Python Basics Quiz"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuizFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!quizTitle.trim() || isCreating}
              onClick={async () => {
                setIsCreating(true);
                try {
                  if (lessonId) {
                    await createCourseQuiz({
                      lessonId,
                      title: quizTitle.trim(),
                    });
                  } else {
                    const lesson = await createCourseLesson({
                      moduleId,
                      title: quizTitle.trim(),
                      description: "",
                      videoUrl: "",
                    });
                    await createCourseQuiz({
                      lessonId: lesson.id,
                      title: quizTitle.trim(),
                    });
                  }
                  appToast.success("Quiz created successfully");
                  setQuizFormOpen(false);
                  setQuizTitle("");
                  await onRefresh();
                } catch (error) {
                  appToast.error(getErrorMessage(error));
                } finally {
                  setIsCreating(false);
                }
              }}
            >
              Create Quiz
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={publishOpen}
        title="Publish Quiz"
        description={`Publish "${selected?.quiz.title ?? ""}"? The quiz must have valid questions before publishing.`}
        onCancel={() => {
          setPublishOpen(false);
          setSelected(null);
        }}
        onConfirm={async () => {
          if (!selected) {
            return;
          }
          try {
            await publishCourseQuiz(selected.quiz.id);
            appToast.success("Quiz published successfully");
            setPublishOpen(false);
            setSelected(null);
            await onRefresh();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Quiz?"
        description={
          selected?.quiz.title
            ? `This action will permanently delete "${selected.quiz.title}".\nThis cannot be undone.`
            : "This action will permanently delete this quiz.\nThis cannot be undone."
        }
        loading={isDeletingQuiz}
        confirmLabel="Delete Permanently"
        loadingLabel="Deleting..."
        confirmVariant="danger"
        onCancel={() => {
          setDeleteOpen(false);
          setSelected(null);
        }}
        onConfirm={async () => {
          if (!selected) {
            return;
          }
          try {
            await deleteCourseQuiz(selected.quiz.id);
            appToast.success("Quiz permanently deleted");
            setDeleteOpen(false);
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

export function ModuleAssignmentsTab({
  emptyDescription = "Create an assignment for this lesson.",
}: {
  emptyDescription?: string;
}) {
  const [search, setSearch] = useState("");

  return (
    <ModuleContentSection
      title="Assignments"
      search={search}
      searchPlaceholder="Search assignments..."
      onSearchChange={setSearch}
      showStatusFilter={false}
      actionLabel="Add Assignment"
      actionDisabled
      onAction={() => {}}
    >
      <ModuleContentTable<{ id: string; displayOrder: number }>
        rows={[]}
        sourceCount={0}
        showReorderColumn={false}
        columns={[
          {
            key: "title",
            header: "Title",
            render: () => null,
          },
          {
            key: "dueDate",
            header: "Due Date",
            render: () => null,
          },
          {
            key: "status",
            header: "Status",
            render: () => null,
          },
        ]}
        emptyTitle="No assignments found"
        emptyDescription={emptyDescription}
        renderActions={() => null}
      />
    </ModuleContentSection>
  );
}
