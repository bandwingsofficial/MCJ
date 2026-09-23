"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { courseLearnItemService } from "@/src/features/course-learn-items/services/course-learn-item.service";
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
import {
  emptyLessonContentSummaryCounts,
  type LessonContentSummaryCounts,
} from "@/src/features/course-modules/utils/lesson-content-summary.util";

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
  lessonContentCountsByLessonId: Map<string, LessonContentSummaryCounts>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function buildLessonContentCountsMap(
  lessons: CourseLesson[],
  resources: ModuleResourceRow[],
  quizLessonIds: Set<string>,
  learnCountByLessonId: Map<string, number>,
): Map<string, LessonContentSummaryCounts> {
  const countsByLessonId = new Map<string, LessonContentSummaryCounts>();

  for (const lesson of lessons) {
    if (lesson.isDeleted) {
      continue;
    }

    countsByLessonId.set(lesson.id, emptyLessonContentSummaryCounts());
  }

  for (const resource of resources) {
    if (resource.isDeleted) {
      continue;
    }

    const entry =
      countsByLessonId.get(resource.lessonId) ??
      emptyLessonContentSummaryCounts();
    entry.resources += 1;
    countsByLessonId.set(resource.lessonId, entry);
  }

  for (const lessonId of quizLessonIds) {
    const entry =
      countsByLessonId.get(lessonId) ?? emptyLessonContentSummaryCounts();
    entry.quizzes = 1;
    countsByLessonId.set(lessonId, entry);
  }

  for (const [lessonId, learnCount] of learnCountByLessonId) {
    const entry =
      countsByLessonId.get(lessonId) ?? emptyLessonContentSummaryCounts();
    entry.learn = learnCount;
    countsByLessonId.set(lessonId, entry);
  }

  for (const lesson of lessons) {
    if (lesson.isDeleted || !lesson.parentLessonId) {
      continue;
    }

    const parentEntry =
      countsByLessonId.get(lesson.parentLessonId) ??
      emptyLessonContentSummaryCounts();

    if (isSelfPacedVideoLesson(lesson)) {
      parentEntry.selfPacedVideos += 1;
    } else if (isLiveRecordedVideoLesson(lesson)) {
      parentEntry.liveRecordedVideos += 1;
    }

    countsByLessonId.set(lesson.parentLessonId, parentEntry);
  }

  for (const lesson of lessons) {
    if (lesson.isDeleted || lesson.parentLessonId) {
      continue;
    }

    const entry =
      countsByLessonId.get(lesson.id) ?? emptyLessonContentSummaryCounts();

    if (isSelfPacedVideoLesson(lesson)) {
      entry.selfPacedVideos += 1;
    } else if (isLiveRecordedVideoLesson(lesson)) {
      entry.liveRecordedVideos += 1;
    }

    countsByLessonId.set(lesson.id, entry);
  }

  return countsByLessonId;
}

export function useModuleContentData(
  moduleId: string,
): UseModuleContentDataReturn {
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [quizLessonIds, setQuizLessonIds] = useState<Set<string>>(new Set());
  const [resources, setResources] = useState<ModuleResourceRow[]>([]);
  const [quizzes, setQuizzes] = useState<ModuleQuizRow[]>([]);
  const [learnCountByLessonId, setLearnCountByLessonId] = useState<
    Map<string, number>
  >(new Map());
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

      const [quizResults, resourceResults, learnResults] = await Promise.all([
        Promise.all(
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
        ),
        Promise.all(
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
        ),
        Promise.all(
          moduleLessons.map(async (lesson) => {
            const response = await courseLearnItemService.getCourseLearnItems({
              lessonId: lesson.id,
              search: "",
            });
            return {
              lessonId: lesson.id,
              count: response.data.length,
            };
          }),
        ),
      ]);

      const quizRows = quizResults.filter(
        (row): row is ModuleQuizRow => row !== null,
      );

      const flatResources = resourceResults.flat();
      const learnMap = new Map<string, number>();

      for (const row of learnResults) {
        learnMap.set(row.lessonId, row.count);
      }

      setLessons(moduleLessons);
      setQuizzes(quizRows);
      setQuizLessonIds(new Set(quizRows.map((row) => row.lessonId)));
      setResources(flatResources);
      setLearnCountByLessonId(learnMap);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load module content.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const resourceShellLessonIds = useMemo(() => {
    const lessonIdsWithResources = new Set(
      resources
        .filter((resource) => !resource.isDeleted)
        .map((resource) => resource.lessonId),
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

  const lessonContentCountsByLessonId = useMemo(
    () =>
      buildLessonContentCountsMap(
        lessons,
        resources,
        quizLessonIds,
        learnCountByLessonId,
      ),
    [lessons, resources, quizLessonIds, learnCountByLessonId],
  );

  return {
    lessons,
    quizLessonIds,
    resourceShellLessonIds,
    resources,
    quizzes,
    lessonContentCountsByLessonId,
    isLoading,
    error,
    refetch: load,
  };
}

/** Root plain lessons shown in module lesson management (includes quiz-backed lessons). */
export function filterNormalLessons(
  lessons: CourseLesson[],
  _quizLessonIds: Set<string>,
  resourceShellLessonIds: Set<string>,
) {
  return lessons.filter(
    (lesson) =>
      !lesson.parentLessonId &&
      !resourceShellLessonIds.has(lesson.id) &&
      isPlainLesson(lesson),
  );
}

export function filterChildSelfPacedVideoLessons(
  lessons: CourseLesson[],
  parentLessonId: string,
) {
  return lessons.filter(
    (lesson) =>
      lesson.parentLessonId === parentLessonId &&
      isSelfPacedVideoLesson(lesson),
  );
}

export function filterChildLiveRecordedVideoLessons(
  lessons: CourseLesson[],
  parentLessonId: string,
) {
  return lessons.filter(
    (lesson) =>
      lesson.parentLessonId === parentLessonId &&
      isLiveRecordedVideoLesson(lesson),
  );
}

export function filterSelfPacedVideoLessons(lessons: CourseLesson[]) {
  return lessons.filter(
    (lesson) => !lesson.parentLessonId && isSelfPacedVideoLesson(lesson),
  );
}

/** @deprecated Use filterSelfPacedVideoLessons instead */
export function filterVideoLessons(lessons: CourseLesson[]) {
  return filterSelfPacedVideoLessons(lessons);
}

export function filterLiveRecordedVideoLessons(lessons: CourseLesson[]) {
  return lessons.filter(
    (lesson) => !lesson.parentLessonId && isLiveRecordedVideoLesson(lesson),
  );
}
