"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GripVertical, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
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
  useDeactivateCourseModule,
  useMoveCourseModule,
  useRestoreCourseModule,
} from "@/src/features/course-modules/hooks";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import type { CourseDetails } from "@/src/features/courses/types/course.types";
import {
  getModuleContentCounts,
} from "@/src/features/courses/utils/course-content-stats.util";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { formatContentOrderNumber } from "@/src/shared/utils/content-order";

interface Props {
  courseId: string;
  course: CourseDetails;
  disabled?: boolean;
  onRefresh?: () => Promise<void>;
  onMutationSuccess?: () => Promise<void>;
}

export function CourseManageModulesPanel({
  courseId,
  course,
  disabled = false,
  onRefresh,
  onMutationSuccess,
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
  const { deactivateCourseModule, isSubmitting: isDeactivating } =
    useDeactivateCourseModule();
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
    disabled || isDeleting || isDeactivating || isRestoring || isReordering;

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
      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-4 shadow-sm">
        <SkeletonTable rows={4} />
      </div>
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
      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#102A56]">Modules</h2>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Manage course modules, lessons, and content order.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            className="h-9 shrink-0 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-4 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] hover:from-[#0284C7] hover:to-[#1D4ED8]"
            onClick={() => {
              setSelectedModule(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Module
          </Button>
        </div>

        <div className="p-4">
        {rows.length === 0 ? (
          <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
            <h3 className="text-base font-semibold text-[#102A56]">
              No modules yet
            </h3>
            <p className="mt-1 max-w-md text-sm text-[#647A9B]">
              Add your first module to start building course content.
            </p>
          </div>
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
                  className={`rounded-xl border border-[#E1EBF5] bg-white px-4 py-3 shadow-[0_1px_4px_rgba(16,42,86,0.04)] transition-all hover:border-[#DCE8F5] hover:shadow-sm ${
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
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-50 to-[#F8FBFF] text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
                        {formatContentOrderNumber(index + 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-[#102A56]">
                          {module.title}
                        </h3>
                        <p className="mt-1 text-xs text-[#647A9B]">
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
        </div>
      </div>

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
              await createCourseModule({
                ...values,
                courseId,
              });
              appToast.success("Module created successfully");
            }
            setSelectedModule(null);
            setFormOpen(false);
            await refetch();
            await onRefresh?.();
            await onMutationSuccess?.();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <CourseModuleStatusDialog
        open={statusOpen}
        module={selectedModule}
        isLoading={isDeactivating || isRestoring}
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
              await deactivateCourseModule(selectedModule.id);
              appToast.success("Module deactivated successfully");
            }

            setStatusOpen(false);
            setSelectedModule(null);
            await refetch();
            await onRefresh?.();
            await onMutationSuccess?.();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <CourseModuleDeleteDialog
        open={deleteOpen}
        moduleTitle={selectedModule?.title}
        contentCounts={
          selectedModule
            ? (() => {
                const treeModule = moduleTreeById.get(selectedModule.id);
                return treeModule
                  ? getModuleContentCounts(treeModule)
                  : undefined;
              })()
            : undefined
        }
        loading={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeleteOpen(false);
            setSelectedModule(null);
          }
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
            await onMutationSuccess?.();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />
    </>
  );
}
