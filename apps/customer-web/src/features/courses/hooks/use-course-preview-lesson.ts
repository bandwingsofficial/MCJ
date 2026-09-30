"use client";

import { useQuery } from "@tanstack/react-query";

import { getCoursePreviewLessonApi } from "@/src/features/courses/api/course.api";
import { mapCoursePreviewLessonDetailDto } from "@/src/features/courses/mappers/course-preview-lesson.mapper";

export function useCoursePreviewLesson(
  courseId: string,
  lessonId: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["course-preview-lesson", courseId, lessonId],
    enabled: enabled && Boolean(courseId) && Boolean(lessonId),
    queryFn: async () => {
      const response = await getCoursePreviewLessonApi(
        courseId,
        lessonId as string,
      );

      return mapCoursePreviewLessonDetailDto(response.data);
    },
    staleTime: 60_000,
    retry: false,
  });
}
