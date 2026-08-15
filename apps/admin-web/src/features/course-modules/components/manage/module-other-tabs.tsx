"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Modal } from "@/src/shared/components/ui/model";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { appToast } from "@/src/shared/components/ui/toast";

import { CourseResourceDeleteDialog, CourseResourceForm } from "@/src/features/course-resources/components";
import {
  useCreateCourseResource,
  useDeleteCourseResource,
  useMoveCourseResource,
  useRestoreCourseResource,
  useUpdateCourseResource,
} from "@/src/features/course-resources/hooks";
import type { CourseResourceFormValues } from "@/src/features/course-resources/types";
import { isResourceTypeLink } from "@/src/features/course-resources/utils/resource-file-validation";
import { useCreateCourseLesson } from "@/src/features/course-lessons/hooks";
import { useCreateCourseQuiz, usePublishCourseQuiz } from "@/src/features/course-quizzes/hooks";
import { ModuleContentActions } from "@/src/features/course-modules/components/manage/module-content-actions";
import { ModuleContentFilters } from "@/src/features/course-modules/components/manage/module-content-filters";
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
}

export function ModuleResourcesTab({
  moduleId,
  resources,
  onRefresh,
}: ResourcesTabProps) {
  const { createCourseLesson } = useCreateCourseLesson();
  const { createCourseResource, isLoading: isCreating } =
    useCreateCourseResource();
  const { updateCourseResource, isLoading: isUpdating } =
    useUpdateCourseResource();
  const { deleteCourseResource } = useDeleteCourseResource();
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

  const filteredRows = useMemo(() => {
    return resources
      .map((resource) => ({
        ...resource,
        isArchived: Boolean(resource.isDeleted || resource.deletedAt),
      }))
      .filter((resource) => {
        if (!matchesArchivedFilter(resource.isArchived, status)) {
          return false;
        }
        if (!search.trim()) {
          return true;
        }
        return resource.title.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [resources, search, status]);

  const pagedRows = paginateRows(filteredRows, page, pageSize);
  const orderOffset = (page - 1) * pageSize;
  const hasRows = filteredRows.length > 0;

  return (
    <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Resources</h2>
        {hasRows ? (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Resource
          </Button>
        ) : null}
      </div>

      <ModuleContentFilters
        search={search}
        status={status}
        searchPlaceholder="Search resources..."
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
      />

      <ModuleContentTable<ResourceTableRow>
        rows={pagedRows}
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
              <p className="font-medium text-slate-900">{row.title}</p>
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
            key: "status",
            header: "Status",
            render: (row) => (
              <ModuleContentStatusBadge isArchived={row.isArchived} />
            ),
          },
        ]}
        emptyTitle="No resources yet"
        emptyDescription="Add notes, PDFs, or other supported learning material."
        emptyAction={
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Resource
          </Button>
        }
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

      <CourseResourceForm
        open={formOpen}
        loading={isCreating || isUpdating}
        lessonId={selected?.lessonId ?? ""}
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
        onClose={() => {
          setDeleteOpen(false);
          setSelected(null);
        }}
        onConfirm={async () => {
          if (!selected) {
            return;
          }
          await deleteCourseResource(selected.id);
          appToast.success("Resource deleted successfully");
          setDeleteOpen(false);
          setSelected(null);
          await onRefresh();
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
    </Card>
  );
}

interface QuizzesTabProps {
  courseId: string;
  moduleId: string;
  quizzes: ModuleQuizRow[];
  onRefresh: () => Promise<void>;
}

export function ModuleQuizzesTab({
  courseId,
  moduleId,
  quizzes,
  onRefresh,
}: QuizzesTabProps) {
  const router = useRouter();
  const { createCourseLesson } = useCreateCourseLesson();
  const { createCourseQuiz } = useCreateCourseQuiz();
  const { publishCourseQuiz } = usePublishCourseQuiz();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [quizFormOpen, setQuizFormOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selected, setSelected] = useState<QuizTableRow | null>(null);

  const filteredRows = useMemo(() => {
    return quizzes
      .map((row) => ({
        ...row,
        id: row.quiz.id,
        displayOrder: row.quiz.displayOrder,
        isArchived: Boolean(row.quiz.isDeleted || row.quiz.deletedAt),
      }))
      .filter((row) => {
        if (status !== "ALL" && row.quiz.status !== status) {
          return false;
        }

        if (!search.trim()) {
          return true;
        }
        return row.quiz.title.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [quizzes, search, status]);

  const pagedRows = paginateRows(filteredRows, page, pageSize);
  const orderOffset = (page - 1) * pageSize;

  return (
    <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Quizzes</h2>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setQuizTitle("");
            setQuizFormOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Quiz
        </Button>
      </div>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search quizzes..."
          className="!h-10 rounded-lg text-[15px]"
        />
        <div className="sm:w-48">
          <AppSelect
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={[
              { label: "All Status", value: "ALL" },
              { label: "Draft", value: "DRAFT" },
              { label: "Published", value: "PUBLISHED" },
            ]}
          />
        </div>
      </div>

      <ModuleContentTable<QuizTableRow>
        rows={pagedRows}
        orderOffset={orderOffset}
        columns={[
          {
            key: "name",
            header: "Quiz Name",
            render: (row) => (
              <p className="font-medium text-slate-900">{row.quiz.title}</p>
            ),
          },
          {
            key: "questions",
            header: "Questions",
            render: (row) => (
              <span className="text-sm text-slate-700">
                {row.questionCount} Question{row.questionCount === 1 ? "" : "s"}
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
        emptyTitle="No quizzes yet"
        emptyDescription="Create a quiz to assess learners."
        renderActions={(row) => (
          <ModuleContentActions
            isArchived={row.isArchived}
            showManage
            onManage={() => {
              router.push(
                `/courses/${courseId}/manage/modules/${moduleId}/lessons/${row.lessonId}/quiz`,
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
    </Card>
  );
}

export function ModuleAssignmentsTab() {
  return (
    <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
      <EmptyState
        title="No assignments yet"
        description="Create an assignment for this module."
        action={
          <Button type="button" size="sm" disabled>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Assignment
          </Button>
        }
      />
    </Card>
  );
}
