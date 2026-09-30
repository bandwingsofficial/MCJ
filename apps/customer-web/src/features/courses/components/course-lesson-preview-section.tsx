"use client";

import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { useCoursePreviewLesson } from "@/src/features/courses/hooks/use-course-preview-lesson";
import { CourseLessonPreviewPanel } from "@/src/features/courses/components/course-lesson-preview-panel";

interface Props {
  courseId: string;
  lessonId: string;
  isOpen: boolean;
}

export function CourseLessonPreviewSection({
  courseId,
  lessonId,
  isOpen,
}: Props) {
  const { data, isLoading, error, isPending } = useCoursePreviewLesson(
    courseId,
    lessonId,
    isOpen,
  );

  if (!isOpen) {
    return null;
  }

  const errorMessage = error ? getErrorMessage(error) : null;

  return (
    <CourseLessonPreviewPanel
      previewVideo={data?.previewVideo ?? null}
      isOpen={isOpen}
      isLoading={isPending && !data}
      errorMessage={errorMessage}
    />
  );
}
