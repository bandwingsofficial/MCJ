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
  liveLessons: number;
  resources: number;
  quizzes: number;
  assignments: number;
}

export function getModuleContentCounts(
  module: CourseModuleTree,
): ModuleContentCounts {
  const lessons = module.lessons ?? [];
  let resources = 0;
  let quizzes = 0;
  let displayLessons = 0;

  for (const lesson of lessons) {
    resources += lesson.resources?.length ?? 0;
    if (lesson.quiz) {
      quizzes += 1;
      continue;
    }
    if (!isResourceOnlyLesson(lesson)) {
      displayLessons += 1;
    }
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
  resources?: CourseLessonTree["resources"];
}): boolean {
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
  let resources = 0;
  let quizzes = 0;

  for (const module of modules) {
    const counts = getModuleContentCounts(module);
    lessons += counts.lessons;
    resources += counts.resources;
    quizzes += counts.quizzes;

    for (const lesson of module.lessons ?? []) {
      if (lesson.videoUrl?.trim()) {
        selfPacedVideos += 1;
      }
    }
  }

  return {
    modules: summary?.modules ?? course?.moduleCount ?? modules.length,
    lessons: summary?.lessons ?? lessons,
    selfPacedVideos,
    liveLessons: 0,
    resources,
    quizzes: summary?.quizzes ?? quizzes,
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
