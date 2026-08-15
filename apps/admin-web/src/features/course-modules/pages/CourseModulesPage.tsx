"use client";

import { useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { PageHeader } from "@/src/shared/components/ui/page-header";

import {
  CourseModuleDeleteDialog,
  CourseModuleForm,
  CourseModuleList,
  CourseModuleMoveDialog,
  CourseModuleSkeleton,
} from "@/src/features/course-modules/components";

import {
  useCourseModules,
  useCreateCourseModule,
  useUpdateCourseModule,
  useDeleteCourseModule,
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
    includeDeleted: false,
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
  } =
    useDeleteCourseModule();

  const {
    restoreCourseModule,
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
    setDeleteOpen(true);
  }}
  onActivate={async (module) => {
    await restoreCourseModule(module.id);
    await refetch();
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
      console.log(
        "Form Values:",
        values
      );

      if (
        selectedModule
      ) {
        console.log(
          "Updating Module..."
        );

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
      } else {
        console.log(
          "Creating Module..."
        );

        await createCourseModule(
          values
        );
      }

      console.log(
        "Success"
      );

      setSelectedModule(
        null
      );

      setFormOpen(false);

      await refetch();
    } catch (error) {
      console.error(
        "Module submit failed:",
        error
      );
    }
  }}
/>
      <CourseModuleDeleteDialog
        open={deleteOpen}
        onClose={() =>
          setDeleteOpen(false)
        }
        onConfirm={async () => {
          if (
            !selectedModule
          ) {
            return;
          }

          await deleteCourseModule(
            selectedModule.id
          );

          setDeleteOpen(false);

          await refetch();
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

          await moveCourseModule(
            selectedModule.id,
            {
              newPosition,
            }
          );

          setMoveOpen(false);

          await refetch();
        }}
      />
    </>
  );
}