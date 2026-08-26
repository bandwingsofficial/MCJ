"use client";

import { useCallback, useEffect, useState } from "react";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";
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

  const [module, setModule] = useState<CourseModule | null>(null);
  const [moduleLoading, setModuleLoading] = useState(true);
  const [moduleError, setModuleError] = useState<string | null>(null);

  const loadModule = useCallback(async () => {
    setModuleLoading(true);
    setModuleError(null);
    try {
      const response = await courseModuleService.getCourseModule(moduleId);
      if (response.data.courseId !== courseId) {
        setModuleError("This module does not belong to the selected course.");
        setModule(null);
        return;
      }
      setModule(response.data);
    } catch (error) {
      setModuleError(getErrorMessage(error));
    } finally {
      setModuleLoading(false);
    }
  }, [courseId, moduleId]);

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
    <div className="-m-6 min-h-full space-y-4 bg-white p-6">
      <ModuleManageWorkspace
        courseId={courseId}
        courseTitle={course.title}
        courseCode={course.slug}
        module={module}
      />
    </div>
  );
}
