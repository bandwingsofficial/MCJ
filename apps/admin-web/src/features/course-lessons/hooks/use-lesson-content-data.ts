"use client";

import { useMemo } from "react";

import {
  useModuleContentData,
  filterChildLiveRecordedVideoLessons,
  filterChildSelfPacedVideoLessons,
  type ModuleQuizRow,
  type ModuleResourceRow,
} from "@/src/features/course-modules/hooks/use-module-content-data";

interface UseLessonContentDataReturn {
  lessons: ReturnType<typeof useModuleContentData>["lessons"];
  quizLessonIds: Set<string>;
  resourceShellLessonIds: Set<string>;
  resources: ModuleResourceRow[];
  quizzes: ModuleQuizRow[];
  selfPacedVideos: ReturnType<typeof useModuleContentData>["lessons"];
  liveRecordedVideos: ReturnType<typeof useModuleContentData>["lessons"];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLessonContentData(
  moduleId: string,
  lessonId: string,
): UseLessonContentDataReturn {
  const moduleData = useModuleContentData(moduleId);

  const resources = useMemo(
    () =>
      moduleData.resources.filter((resource) => resource.lessonId === lessonId),
    [moduleData.resources, lessonId],
  );

  const quizzes = useMemo(
    () => moduleData.quizzes.filter((quiz) => quiz.lessonId === lessonId),
    [moduleData.quizzes, lessonId],
  );

  const selfPacedVideos = useMemo(
    () =>
      filterChildSelfPacedVideoLessons(
        moduleData.lessons,
        lessonId,
        moduleData.quizLessonIds,
      ),
    [moduleData.lessons, lessonId, moduleData.quizLessonIds],
  );

  const liveRecordedVideos = useMemo(
    () =>
      filterChildLiveRecordedVideoLessons(
        moduleData.lessons,
        lessonId,
        moduleData.quizLessonIds,
      ),
    [moduleData.lessons, lessonId, moduleData.quizLessonIds],
  );

  return {
    lessons: moduleData.lessons,
    quizLessonIds: moduleData.quizLessonIds,
    resourceShellLessonIds: moduleData.resourceShellLessonIds,
    resources,
    quizzes,
    selfPacedVideos,
    liveRecordedVideos,
    isLoading: moduleData.isLoading,
    error: moduleData.error,
    refetch: moduleData.refetch,
  };
}
