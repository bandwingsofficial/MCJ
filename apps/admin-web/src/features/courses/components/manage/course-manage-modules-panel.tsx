"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useInitialLoadingOnly } from "@/src/shared/hooks/use-initial-loading-only";
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
import { useCourseModuleDeleteDialog } from "@/src/features/course-modules/hooks/use-course-module-delete-dialog";
import { useCourseModuleStatusDialog } from "@/src/features/course-modules/hooks/use-course-module-status-dialog";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import type { CourseDetails } from "@/src/features/courses/types/course.types";
import {
  getModuleContentCounts,
  hasAuthoritativeModuleCounts,
} from "@/src/features/courses/utils/course-content-stats.util";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { formatContentOrderNumber } from "@/src/shared/utils/content-order";
import { reorderByDrag } from "@/src/shared/utils/reorder-drag.utils";

interface Props {
  courseId: string;
  course: CourseDetails;
  disabled?: boolean;
  onRefresh?: () => Promise<void>;
}

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

  const isInitialLoading = useInitialLoadingOnly(isLoading);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[CourseManageModulesPanel] mount", { courseId });
      return () => {
        console.log("[CourseManageModulesPanel] unmount", { courseId });
      };
    }
  }, [courseId]);

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
  const moduleDeleteDialog = useCourseModuleDeleteDialog();
  const moduleStatusDialog = useCourseModuleStatusDialog();
  const [rows, setRows] = useState<CourseModule[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const reorderInFlightRef = useRef(false);
  const courseStatsKey = [
    course.moduleCount ?? 0,
    course.lessonCount ?? 0,
    course.resourceCount ?? 0,
    course.quizCount ?? 0,
  ].join(":");
  const previousCourseStatsKey = useRef(courseStatsKey);

  useEffect(() => {
    if (previousCourseStatsKey.current === courseStatsKey) {
      return;
    }
    previousCourseStatsKey.current = courseStatsKey;
    void refetch();
  }, [courseStatsKey, refetch]);

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

    const reordered = reorderByDrag(rows, dragId, targetId);
    if (!reordered) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const previousRows = rows;
    setRows(reordered.nextItems);
    setDragId(null);
    setDropTargetId(null);

    reorderInFlightRef.current = true;
    setIsReordering(true);

    try {
      await moveCourseModule(dragId, {
        newPosition: reordered.newPosition,
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

  const moduleForm = (
    <CourseModuleForm
      open={formOpen}
      loading={isCreating || isUpdating}
      module={selectedModule ?? undefined}
      courseId={courseId}
      onClose={() => {
        setFormOpen(false);
      }}
      onCancel={() => {
        setSelectedModule(null);
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
        } catch (err) {
          appToast.error(getErrorMessage(err));
        }
      }}
    />
  );

  const moduleDialogs = (
    <>
      <CourseModuleStatusDialog
        open={moduleStatusDialog.open}
        mode={moduleStatusDialog.mode}
        description={moduleStatusDialog.description}
        canProceed={moduleStatusDialog.canProceed}
        isLoading={
          isDeactivating ||
          isRestoring ||
          moduleStatusDialog.checking
        }
        onClose={() => {
          if (!isDeactivating && !isRestoring) {
            moduleStatusDialog.close();
            setSelectedModule(null);
          }
        }}
        onConfirm={async () => {
          const moduleId = moduleStatusDialog.moduleId;
          if (!moduleId) {
            return;
          }

          try {
            if (moduleStatusDialog.mode === "activate") {
              await restoreCourseModule(moduleId);
              appToast.success("Module activated successfully");
            } else {
              await deactivateCourseModule(moduleId);
              appToast.success("Module deactivated successfully");
            }

            moduleStatusDialog.close();
            setSelectedModule(null);
            await refetch();
            await onRefresh?.();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <CourseModuleDeleteDialog
        open={moduleDeleteDialog.open}
        description={moduleDeleteDialog.description}
        canDelete={moduleDeleteDialog.canDelete}
        loading={isDeleting || moduleDeleteDialog.checking}
        onClose={() => {
          if (!isDeleting) {
            moduleDeleteDialog.close();
            setSelectedModule(null);
          }
        }}
        onConfirm={async () => {
          const moduleId = moduleDeleteDialog.moduleId;
          if (!moduleId) {
            return;
          }

          try {
            await deleteCourseModule(moduleId);
            appToast.success("Module deleted successfully");
            moduleDeleteDialog.close();
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
        {error ? (
          <ErrorState
            title="Failed to load modules"
            description={error}
            onRetry={() => {
              void refetch();
            }}
          />
        ) : isInitialLoading ? (
          <SkeletonTable rows={4} />
        ) : rows.length === 0 ? (
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
              const counts = getModuleContentCounts(
                hasAuthoritativeModuleCounts(module)
                  ? module
                  : (treeModule ?? module),
              );
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
                          {counts.assignments > 0 ? (
                            <>
                              {" · "}
                              {counts.assignments} Assignment
                              {counts.assignments === 1 ? "" : "s"}
                            </>
                          ) : null}
                        </p>
                        <div className="mt-2">
                          <CourseModuleStatusBadge module={module} />
                        </div>
                      </div>
                    </div>

                    <CourseModuleActions
                      courseId={courseId}
                      module={module}
                      disabled={
                        actionsDisabled ||
                        moduleDeleteDialog.checking ||
                        moduleStatusDialog.checking
                      }
                      onEdit={(next) => {
                        setSelectedModule(next);
                        setFormOpen(true);
                      }}
                      onDeactivate={(next) => {
                        setSelectedModule(next);
                        void moduleStatusDialog.openStatusDialog({
                          moduleId: next.id,
                          moduleTitle: next.title,
                          mode: "deactivate",
                        });
                      }}
                      onActivate={(next) => {
                        setSelectedModule(next);
                        void moduleStatusDialog.openStatusDialog({
                          moduleId: next.id,
                          moduleTitle: next.title,
                          mode: "activate",
                        });
                      }}
                      onDelete={(next) => {
                        setSelectedModule(next);
                        const treeModule = moduleTreeById.get(next.id);
                        const deleteCounts = getModuleContentCounts(
                          hasAuthoritativeModuleCounts(next)
                            ? next
                            : (treeModule ?? next),
                        );
                        void moduleDeleteDialog.openDeleteDialog({
                          moduleId: next.id,
                          moduleTitle: next.title,
                          contentCounts: deleteCounts,
                        });
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

      {moduleForm}
      {moduleDialogs}
    </>
  );
}
