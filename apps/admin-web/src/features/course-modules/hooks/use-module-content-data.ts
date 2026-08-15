"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { courseLessonService } from "@/src/features/course-lessons/services/course-lesson.service";
import type { CourseLesson } from "@/src/features/course-lessons/types";
import { courseQuizService } from "@/src/features/course-quizzes/services/course-quiz.service";
import { courseResourceService } from "@/src/features/course-resources/services/course-resource.service";
import type { CourseResource } from "@/src/features/course-resources/types";
import type { CourseQuizDetail } from "@/src/features/course-quizzes/types/course-quiz.types";
import {
  isPlainLesson,
  isSelfPacedVideoLesson,
  isLiveRecordedVideoLesson,
} from "@/src/features/course-modules/utils/module-content.utils";

export interface ModuleResourceRow extends CourseResource {
  lessonTitle: string;
}

export interface ModuleQuizRow {
  lessonId: string;
  quiz: CourseQuizDetail;
  questionCount: number;
}

interface UseModuleContentDataReturn {
  lessons: CourseLesson[];
  quizLessonIds: Set<string>;
  resourceShellLessonIds: Set<string>;
  resources: ModuleResourceRow[];
  quizzes: ModuleQuizRow[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useModuleContentData(
  moduleId: string,
): UseModuleContentDataReturn {
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [quizLessonIds, setQuizLessonIds] = useState<Set<string>>(new Set());
  const [resources, setResources] = useState<ModuleResourceRow[]>([]);
  const [quizzes, setQuizzes] = useState<ModuleQuizRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!moduleId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const lessonsResponse = await courseLessonService.getCourseLessons({
        moduleId,
        includeDeleted: true,
      });

      const moduleLessons = lessonsResponse.data;
      setLessons(moduleLessons);

      const quizResults = await Promise.all(
        moduleLessons.map(async (lesson) => {
          const response = await courseQuizService.getCourseQuizzes({
            lessonId: lesson.id,
            includeDeleted: false,
          });
          const quiz = response.data[0];
          if (!quiz) {
            return null;
          }

          const detail = await courseQuizService.getCourseQuiz(quiz.id);
          return {
            lessonId: lesson.id,
            quiz: detail.data,
            questionCount: detail.data.questions?.length ?? 0,
          };
        }),
      );

      const quizRows = quizResults.filter(
        (row): row is ModuleQuizRow => row !== null,
      );

      const resourceResults = await Promise.all(
        moduleLessons.map(async (lesson) => {
          const response = await courseResourceService.getCourseResources({
            lessonId: lesson.id,
            search: "",
            includeDeleted: true,
          });
          return response.data.map((resource) => ({
            ...resource,
            lessonTitle: lesson.title,
          }));
        }),
      );

      const flatResources = resourceResults.flat();
      setLessons(moduleLessons);
      setQuizzes(quizRows);
      setQuizLessonIds(new Set(quizRows.map((row) => row.lessonId)));
      setResources(flatResources);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load module content.");
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const resourceShellLessonIds = useMemo(() => {
    const lessonIdsWithResources = new Set(
      resources.map((resource) => resource.lessonId),
    );
    const shellIds = new Set<string>();

    for (const lesson of lessons) {
      if (
        lessonIdsWithResources.has(lesson.id) &&
        isPlainLesson(lesson) &&
        !lesson.description?.trim() &&
        !quizLessonIds.has(lesson.id)
      ) {
        shellIds.add(lesson.id);
      }
    }

    return shellIds;
  }, [lessons, resources, quizLessonIds]);

  return {
    lessons,
    quizLessonIds,
    resourceShellLessonIds,
    resources,
    quizzes,
    isLoading,
    error,
    refetch: load,
  };
}

export function filterNormalLessons(
  lessons: CourseLesson[],
  quizLessonIds: Set<string>,
  resourceShellLessonIds: Set<string>,
) {
  return lessons.filter(
    (lesson) =>
      !quizLessonIds.has(lesson.id) &&
      !resourceShellLessonIds.has(lesson.id) &&
      isPlainLesson(lesson),
  );
}

export function filterSelfPacedVideoLessons(
  lessons: CourseLesson[],
  quizLessonIds: Set<string>,
) {
  return lessons.filter(
    (lesson) =>
      isSelfPacedVideoLesson(lesson) && !quizLessonIds.has(lesson.id),
  );
}

/** @deprecated Use filterSelfPacedVideoLessons instead */
export function filterVideoLessons(
  lessons: CourseLesson[],
  quizLessonIds: Set<string>,
) {
  return filterSelfPacedVideoLessons(lessons, quizLessonIds);
}

export function filterLiveRecordedVideoLessons(
  lessons: CourseLesson[],
  quizLessonIds: Set<string>,
) {
  return lessons.filter(
    (lesson) =>
      isLiveRecordedVideoLesson(lesson) && !quizLessonIds.has(lesson.id),
  );
}
