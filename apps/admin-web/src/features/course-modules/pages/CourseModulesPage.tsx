"use client";

import { useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  CourseModuleDeleteDialog,
  CourseModuleForm,
  CourseModuleList,
  CourseModuleMoveDialog,
  CourseModuleSkeleton,
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

import type {
  CourseModule,
} from "@/src/features/course-modules/types/course-module.types";

interface CourseModulesPageProps {
  courseId: string;
}

export function CourseModulesPage({
  courseId,
}: CourseModulesPageProps) {
  const {
    modules,
    isLoading,
    error,
    refetch,
  } = useCourseModules({
    courseId,
    includeDeleted: true,
  });

  const {
    createCourseModule,
    isSubmitting,
  } =
    useCreateCourseModule();

  const {
    updateCourseModule,
    isSubmitting: isUpdating,
  } = useUpdateCourseModule();

  const {
    deleteCourseModule,
    isSubmitting: isDeleting,
  } =
    useDeleteCourseModule();

  const {
    deactivateCourseModule,
    isSubmitting: isDeactivating,
  } =
    useDeactivateCourseModule();

  const {
    restoreCourseModule,
    isSubmitting: isRestoring,
  } =
    useRestoreCourseModule();

  const {
    moveCourseModule,
  } =
    useMoveCourseModule();

  const [
    selectedModule,
    setSelectedModule,
  ] =
    useState<CourseModule | null>(
      null
    );

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    statusOpen,
    setStatusOpen,
  ] = useState(false);

  const [
    moveOpen,
    setMoveOpen,
  ] = useState(false);

  if (isLoading) {
    return (
      <CourseModuleSkeleton />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed To Load Modules"
        description={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Course Modules"
        description="Manage course modules"
        actions={
          <Button
            onClick={() =>
              setFormOpen(true)
            }
          >
            Add Module
          </Button>
        }
      />

      <CourseModuleList
        courseId={courseId}
        modules={modules}
        onCreate={() =>
          setFormOpen(true)
        }
        onEdit={(module) => {
          setSelectedModule(
            module,
          );

          setFormOpen(true);
        }}
        onDeactivate={(module) => {
          setSelectedModule(module);
          setStatusOpen(true);
        }}
        onActivate={(module) => {
          setSelectedModule(module);
          setStatusOpen(true);
        }}
        onDelete={(module) => {
          setSelectedModule(
            module,
          );

          setDeleteOpen(true);
        }}
      />

      <CourseModuleForm
        open={formOpen}
        loading={
          isSubmitting ||
          isUpdating
        }
        module={
          selectedModule ??
          undefined
        }
        courseId={courseId}
        onClose={() => {
          setSelectedModule(
            null
          );

          setFormOpen(false);
        }}
        onSubmit={async (
          values
        ) => {
          try {
            if (
              selectedModule
            ) {
              await updateCourseModule(
                selectedModule.id,
                {
                  title:
                    values.title,
                  description:
                    values.description,
                  keySkills:
                    values.keySkills,
                }
              );
              appToast.success("Module updated successfully");
            } else {
              await createCourseModule(
                {
                  ...values,
                  courseId,
                }
              );
              appToast.success("Module created successfully");
            }

            setSelectedModule(
              null
            );

            setFormOpen(false);

            await refetch();
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
          if (!isDeleting) {
            setDeleteOpen(false);
            setSelectedModule(null);
          }
        }}
        onConfirm={async () => {
          if (
            !selectedModule
          ) {
            return;
          }

          try {
            await deleteCourseModule(
              selectedModule.id
            );
            appToast.success("Module deleted successfully");
            setDeleteOpen(false);
            setSelectedModule(null);
            await refetch();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <CourseModuleMoveDialog
        open={moveOpen}
        currentPosition={
          selectedModule
            ?.displayOrder ??
          1
        }
        onClose={() =>
          setMoveOpen(false)
        }
        onSubmit={async (
          newPosition
        ) => {
          if (
            !selectedModule
          ) {
            return;
          }

          try {
            await moveCourseModule(
              selectedModule.id,
              {
                newPosition,
              }
            );
            setMoveOpen(false);
            await refetch();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />
    </>
  );
}
