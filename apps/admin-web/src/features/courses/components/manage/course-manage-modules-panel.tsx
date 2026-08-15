"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GripVertical, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";

import {
  CourseModuleActions,
  CourseModuleDeleteDialog,
  CourseModuleForm,
  CourseModuleStatusBadge,
  CourseModuleStatusDialog,
} from "@/src/features/course-modules/components";
import {
  useCourseModules,
  useCreateCourseModule,
  useUpdateCourseModule,
  useDeleteCourseModule,
  useMoveCourseModule,
  useRestoreCourseModule,
} from "@/src/features/course-modules/hooks";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import type { CourseDetails } from "@/src/features/courses/types/course.types";
import {
  getModuleContentCounts,
} from "@/src/features/courses/utils/course-content-stats.util";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface Props {
  courseId: string;
  course: CourseDetails;
  disabled?: boolean;
  onRefresh?: () => Promise<void>;
}

import { formatContentOrderNumber } from "@/src/shared/utils/content-order";

export function CourseManageModulesPanel({
  courseId,
  course,
  disabled = false,
  onRefresh,
}: Props) {
  const { modules, isLoading, error, refetch } = useCourseModules({
    courseId,
    includeDeleted: true,
  });

  const { createCourseModule, isSubmitting: isCreating } =
    useCreateCourseModule();
  const { updateCourseModule, isSubmitting: isUpdating } =
    useUpdateCourseModule();
  const { deleteCourseModule, isSubmitting: isDeleting } =
    useDeleteCourseModule();
  const { restoreCourseModule, isSubmitting: isRestoring } =
    useRestoreCourseModule();
  const { moveCourseModule } = useMoveCourseModule();

  const [selectedModule, setSelectedModule] =
    useState<CourseModule | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [rows, setRows] = useState<CourseModule[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const reorderInFlightRef = useRef(false);

  const moduleTreeById = useMemo(() => {
    return new Map(
      (course.modules ?? []).map((module) => [module.id, module]),
    );
  }, [course.modules]);

  const sortedModules = useMemo(
    () => [...modules].sort((a, b) => a.displayOrder - b.displayOrder),
    [modules],
  );

  useEffect(() => {
    setRows(sortedModules);
  }, [sortedModules]);

  const actionsDisabled =
    disabled || isDeleting || isRestoring || isReordering;

  const handleDrop = async (targetId: string) => {
    if (
      !dragId ||
      dragId === targetId ||
      actionsDisabled ||
      reorderInFlightRef.current
    ) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const sourceIndex = rows.findIndex((item) => item.id === dragId);
    const targetIndex = rows.findIndex((item) => item.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const previousRows = rows;
    const nextRows = [...rows];
    const [moved] = nextRows.splice(sourceIndex, 1);
    nextRows.splice(targetIndex, 0, moved);
    setRows(nextRows);
    setDragId(null);
    setDropTargetId(null);

    reorderInFlightRef.current = true;
    setIsReordering(true);

    try {
      const target = sortedModules.find((item) => item.id === targetId);
      if (!target) {
        throw new Error("Unable to resolve module order.");
      }

      await moveCourseModule(dragId, {
        newPosition: target.displayOrder,
      });
      await refetch();
      await onRefresh?.();
      appToast.success("Module reordered");
    } catch (err) {
      setRows(previousRows);
      appToast.error(getErrorMessage(err));
    } finally {
      reorderInFlightRef.current = false;
      setIsReordering(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
        <SkeletonTable rows={4} />
      </Card>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load modules"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Modules</h2>
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            onClick={() => {
              setSelectedModule(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Module
          </Button>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No modules yet"
            description="Add your first module to start building course content."
            action={
              <Button
                type="button"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  setSelectedModule(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Module
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {rows.map((module, index) => {
              const treeModule = moduleTreeById.get(module.id);
              const counts = treeModule
                ? getModuleContentCounts(treeModule)
                : {
                    lessons: 0,
                    resources: 0,
                    quizzes: 0,
                    assignments: 0,
                  };
              const draggable =
                !actionsDisabled &&
                !module.isDeleted &&
                !reorderInFlightRef.current;

              return (
                <div
                  key={module.id}
                  draggable={draggable}
                  onDragStart={() => {
                    if (draggable) {
                      setDragId(module.id);
                    }
                  }}
                  onDragOver={(event) => {
                    if (draggable && dragId && dragId !== module.id) {
                      event.preventDefault();
                      setDropTargetId(module.id);
                    }
                  }}
                  onDrop={() => {
                    void handleDrop(module.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setDropTargetId(null);
                  }}
                  className={`rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-slate-300 ${
                    dragId === module.id ? "opacity-60" : ""
                  } ${
                    dropTargetId === module.id ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span className="mt-0.5 text-slate-400">
                        {draggable ? (
                          <GripVertical
                            className="h-4 w-4 cursor-grab"
                            aria-hidden
                          />
                        ) : (
                          <span className="inline-block h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold tabular-nums text-slate-500">
                            {formatContentOrderNumber(index + 1)}
                          </span>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {module.title}
                          </h3>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {counts.lessons} Lesson
                          {counts.lessons === 1 ? "" : "s"}
                          {" · "}
                          {counts.resources} Resource
                          {counts.resources === 1 ? "" : "s"}
                          {" · "}
                          {counts.quizzes} Quiz
                          {counts.quizzes === 1 ? "" : "zes"}
                          {" · "}
                          {counts.assignments} Assignment
                          {counts.assignments === 1 ? "" : "s"}
                        </p>
                        <div className="mt-2">
                          <CourseModuleStatusBadge module={module} />
                        </div>
                      </div>
                    </div>

                    <CourseModuleActions
                      courseId={courseId}
                      module={module}
                      disabled={actionsDisabled}
                      onEdit={(next) => {
                        setSelectedModule(next);
                        setFormOpen(true);
                      }}
                      onDeactivate={(next) => {
                        setSelectedModule(next);
                        setStatusOpen(true);
                      }}
                      onActivate={(next) => {
                        setSelectedModule(next);
                        setStatusOpen(true);
                      }}
                      onDelete={(next) => {
                        setSelectedModule(next);
                        setDeleteOpen(true);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <CourseModuleForm
        open={formOpen}
        loading={isCreating || isUpdating}
        module={selectedModule ?? undefined}
        courseId={courseId}
        onClose={() => {
          setSelectedModule(null);
          setFormOpen(false);
        }}
        onSubmit={async (values) => {
          try {
            if (selectedModule) {
              await updateCourseModule(selectedModule.id, {
                title: values.title,
                description: values.description,
                keySkills: values.keySkills,
              });
              appToast.success("Module updated successfully");
            } else {
              await createCourseModule(values);
              appToast.success("Module created successfully");
            }
            setSelectedModule(null);
            setFormOpen(false);
            await refetch();
            await onRefresh?.();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <CourseModuleStatusDialog
        open={statusOpen}
        module={selectedModule}
        isLoading={isDeleting || isRestoring}
        onClose={() => {
          setStatusOpen(false);
          setSelectedModule(null);
        }}
        onConfirm={async () => {
          if (!selectedModule) {
            return;
          }

          try {
            const isArchived = Boolean(
              selectedModule.isDeleted || selectedModule.deletedAt,
            );

            if (isArchived) {
              await restoreCourseModule(selectedModule.id);
              appToast.success("Module activated successfully");
            } else {
              await deleteCourseModule(selectedModule.id);
              appToast.success("Module deactivated successfully");
            }

            setStatusOpen(false);
            setSelectedModule(null);
            await refetch();
            await onRefresh?.();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <CourseModuleDeleteDialog
        open={deleteOpen}
        moduleTitle={selectedModule?.title}
        loading={isDeleting}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedModule(null);
        }}
        onConfirm={async () => {
          if (!selectedModule) {
            return;
          }

          try {
            await deleteCourseModule(selectedModule.id);
            appToast.success("Module deleted successfully");
            setDeleteOpen(false);
            setSelectedModule(null);
            await refetch();
            await onRefresh?.();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />
    </>
  );
}
