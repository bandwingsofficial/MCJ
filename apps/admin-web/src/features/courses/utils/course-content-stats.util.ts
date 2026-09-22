import {
  isLiveRecordedVideoLesson,
  isSelfPacedVideoLesson,
} from "@/src/features/course-modules/utils/module-content.utils";

import type {
  CourseDetails,
  CourseLessonTree,
  CourseModuleTree,
  CourseSummary,
} from "@/src/features/courses/types/course.types";

export interface ModuleContentCounts {
  lessons: number;
  resources: number;
  quizzes: number;
  assignments: number;
}

export interface CourseContentStats {
  modules: number;
  lessons: number;
  selfPacedVideos: number;
  liveRecordedVideos: number;
  liveLessons: number;
  resources: number;
  quizzes: number;
  assignments: number;
}

interface ModuleCountSource {
  id?: string;
  lessonCount?: number;
  resourceCount?: number;
  quizCount?: number;
  assignmentCount?: number;
  selfPacedVideoCount?: number;
  liveRecordedVideoCount?: number;
  lessons?: CourseLessonTree[];
}

export function hasAuthoritativeModuleCounts(
  module: ModuleCountSource | null | undefined,
): module is ModuleCountSource & { lessonCount: number; resourceCount: number } {
  return (
    typeof module?.lessonCount === "number" &&
    typeof module?.resourceCount === "number"
  );
}

export function getModuleContentCounts(
  module: ModuleCountSource,
): ModuleContentCounts {
  if (hasAuthoritativeModuleCounts(module)) {
    return {
      lessons: module.lessonCount,
      resources: module.resourceCount,
      quizzes: module.quizCount ?? 0,
      assignments: module.assignmentCount ?? 0,
    };
  }

  return getModuleContentCountsFromLessons(module.lessons ?? []);
}

export function getModuleContentCountsFromLessons(
  lessons: CourseLessonTree[],
): ModuleContentCounts {
  let resources = 0;
  let quizzes = 0;
  let displayLessons = 0;

  for (const lesson of lessons) {
    resources += lesson.resources?.length ?? 0;
    if (lesson.quiz) {
      quizzes += 1;
    }

    if (lesson.parentLessonId) {
      continue;
    }

    if (isSelfPacedVideoLesson(lesson) || isLiveRecordedVideoLesson(lesson)) {
      continue;
    }

    if (lesson.quiz) {
      continue;
    }

    if (isResourceOnlyLesson(lesson)) {
      continue;
    }

    displayLessons += 1;
  }

  return {
    lessons: displayLessons,
    resources,
    quizzes,
    assignments: 0,
  };
}

export function isResourceOnlyLesson(lesson: {
  videoUrl?: string | null;
  description?: string | null;
  contentType?: CourseLessonTree["contentType"];
  parentLessonId?: string | null;
  resources?: CourseLessonTree["resources"];
}): boolean {
  if (lesson.parentLessonId) {
    return false;
  }

  if (lesson.contentType && lesson.contentType !== "LESSON") {
    return false;
  }

  const hasResources = (lesson.resources?.length ?? 0) > 0;
  const hasVideo = Boolean(lesson.videoUrl?.trim());
  const hasDescription = Boolean(lesson.description?.trim());

  return hasResources && !hasVideo && !hasDescription;
}

export function computeCourseContentStats(
  course: CourseDetails | null,
  summary: CourseSummary | null,
): CourseContentStats {
  const modules = course?.modules ?? [];
  let lessons = 0;
  let selfPacedVideos = 0;
  let liveRecordedVideos = 0;
  let resources = 0;
  let quizzes = 0;

  for (const module of modules) {
    const counts = getModuleContentCounts(module);
    lessons += counts.lessons;
    resources += counts.resources;
    quizzes += counts.quizzes;

    if (
      typeof module.selfPacedVideoCount === "number" &&
      typeof module.liveRecordedVideoCount === "number"
    ) {
      selfPacedVideos += module.selfPacedVideoCount;
      liveRecordedVideos += module.liveRecordedVideoCount;
    } else {
      for (const lesson of module.lessons ?? []) {
        if (isSelfPacedVideoLesson(lesson)) {
          selfPacedVideos += 1;
        }
        if (isLiveRecordedVideoLesson(lesson)) {
          liveRecordedVideos += 1;
        }
      }
    }
  }

  return {
    modules: course?.moduleCount ?? summary?.modules ?? modules.length,
    lessons: course?.lessonCount ?? lessons,
    selfPacedVideos: course?.selfPacedVideoCount ?? selfPacedVideos,
    liveRecordedVideos: course?.liveRecordedVideoCount ?? liveRecordedVideos,
    liveLessons: course?.liveRecordedVideoCount ?? liveRecordedVideos,
    resources: course?.resourceCount ?? resources,
    quizzes: course?.quizCount ?? summary?.quizzes ?? quizzes,
    assignments: 0,
  };
}

export function getLessonTypeLabel(
  lesson: CourseLessonTree,
  hasQuiz?: boolean,
): string {
  if (hasQuiz || lesson.quiz) {
    return "Quiz";
  }
  if (lesson.videoUrl?.trim()) {
    return "Self-Paced Video";
  }
  return "Lesson";
}

export function formatLessonDuration(
  duration: number | null | undefined,
): string {
  if (duration == null || duration <= 0) {
    return "—";
  }
  return `${duration} min`;
}
