"use client";

import { useCallback, useEffect, useState } from "react";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { appToast } from "@/src/shared/components/ui/toast";

import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";
import { useUpdateCourseModule } from "@/src/features/course-modules/hooks";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import { ModuleManageWorkspace } from "@/src/features/course-modules/components/manage/module-manage-workspace";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface Props {
  courseId: string;
  moduleId: string;
}

export function CourseModuleManagePage({
  courseId,
  moduleId,
}: Props) {
  const { course, isLoading: courseLoading } = useCourse(courseId);
  const { updateCourseModule, isSubmitting: isUpdatingModule } =
    useUpdateCourseModule();

  const [module, setModule] = useState<CourseModule | null>(null);
  const [moduleLoading, setModuleLoading] = useState(true);
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const loadModule = useCallback(async () => {
    setModuleLoading(true);
    setModuleError(null);
    try {
      const response = await courseModuleService.getCourseModule(moduleId);
      setModule(response.data);
    } catch (error) {
      setModuleError(getErrorMessage(error));
    } finally {
      setModuleLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    void loadModule();
  }, [loadModule]);

  if (courseLoading || moduleLoading) {
    return <Loader />;
  }

  if (moduleError || !module) {
    return (
      <ErrorState
        title="Module Not Found"
        description={moduleError ?? "Unable to load this module."}
        onRetry={() => {
          void loadModule();
        }}
      />
    );
  }

  if (!course) {
    return (
      <ErrorState
        title="Course Not Found"
        description="Unable to load course details for this module."
      />
    );
  }

  return (
    <ModuleManageWorkspace
      courseId={courseId}
      courseTitle={course.title}
      courseCode={course.slug}
      module={module}
      editOpen={editOpen}
      editLoading={isUpdatingModule}
      onEditOpen={() => setEditOpen(true)}
      onEditClose={() => setEditOpen(false)}
      onEditSubmit={async (values) => {
        try {
          const response = await updateCourseModule(module.id, values);
          setModule(response);
          setEditOpen(false);
          appToast.success("Module updated successfully");
        } catch (error) {
          appToast.error(getErrorMessage(error));
        }
      }}
    />
  );
}
