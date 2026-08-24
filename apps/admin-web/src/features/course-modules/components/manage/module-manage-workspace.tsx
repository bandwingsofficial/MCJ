"use client";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import { ModuleManageHeader } from "@/src/features/course-modules/components/manage/module-manage-header";
import { ModuleLessonsTab } from "@/src/features/course-modules/components/manage/module-lessons-tab";
import { useModuleContentData } from "@/src/features/course-modules/hooks/use-module-content-data";

interface Props {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  module: CourseModule;
}

export function ModuleManageWorkspace({
  courseId,
  courseTitle,
  courseCode,
  module,
}: Props) {
  const {
    lessons,
    quizLessonIds,
    resourceShellLessonIds,
    isLoading,
    error,
    refetch,
  } = useModuleContentData(module.id);

  return (
    <div className="space-y-4">
      <ModuleManageHeader
        courseId={courseId}
        courseTitle={courseTitle}
        courseCode={courseCode}
        module={module}
      />

      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : error ? (
        <ErrorState
          title="Failed to load module content"
          description={error}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : (
        <ModuleLessonsTab
          courseId={courseId}
          moduleId={module.id}
          lessons={lessons}
          quizLessonIds={quizLessonIds}
          resourceShellLessonIds={resourceShellLessonIds}
          onRefresh={refetch}
        />
      )}
    </div>
  );
}
