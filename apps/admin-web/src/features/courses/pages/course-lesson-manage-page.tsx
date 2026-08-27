"use client";

import { useCallback, useEffect, useState } from "react";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import { courseLessonService } from "@/src/features/course-lessons/services/course-lesson.service";
import type { CourseLesson } from "@/src/features/course-lessons/types";
import { LessonManageWorkspace } from "@/src/features/course-lessons/components/manage/lesson-manage-workspace";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface Props {
  courseId: string;
  moduleId: string;
  lessonId: string;
}

export function CourseLessonManagePage({
  courseId,
  moduleId,
  lessonId,
}: Props) {
  const { course, isLoading: courseLoading } = useCourse(courseId);

  const [module, setModule] = useState<CourseModule | null>(null);
  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [moduleResponse, lessonResponse] = await Promise.all([
        courseModuleService.getCourseModule(moduleId),
        courseLessonService.getCourseLesson(lessonId),
      ]);

      if (moduleResponse.data.courseId !== courseId) {
        setError("This module does not belong to the selected course.");
        setModule(null);
        setLesson(null);
        return;
      }

      if (lessonResponse.data.moduleId !== moduleId) {
        setError("This lesson does not belong to the selected module.");
        setModule(null);
        setLesson(null);
        return;
      }

      setModule(moduleResponse.data);
      setLesson(lessonResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
      setModule(null);
      setLesson(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, moduleId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (courseLoading || loading) {
    return <Loader />;
  }

  if (error || !module || !lesson) {
    return (
      <ErrorState
        title="Lesson Not Found"
        description={error ?? "Unable to load this lesson."}
        onRetry={() => {
          void loadData();
        }}
      />
    );
  }

  if (!course) {
    return (
      <ErrorState
        title="Course Not Found"
        description="Unable to load course details for this lesson."
      />
    );
  }

  return (
    <div className="min-h-full space-y-4">
      <LessonManageWorkspace
        courseId={courseId}
        courseTitle={course.title}
        courseCode={course.slug}
        module={module}
        lesson={lesson}
      />
    </div>
  );
}
