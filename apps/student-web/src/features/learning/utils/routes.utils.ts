import { env } from "@/src/core/config/env";

import type { LearningContentMode } from "@/src/features/learning/types/learning.types";
import { learningContentModeToSearchParam } from "@/src/features/learning/utils/learning-mode-navigation.utils";

export function getCustomerWebUrl(path = "/"): string {
  return new URL(path, env.CUSTOMER_WEB_URL).toString();
}

export function getStudentLearningUrl(path = "/student/learning"): string {
  return new URL(path, env.STUDENT_WEB_URL).toString();
}

export function getCourseLearningPath(courseId: string): string {
  return `/student/learning/${courseId}`;
}

export function getModuleLearningPath(
  courseId: string,
  moduleId: string,
): string {
  return `/student/learning/${courseId}/modules/${moduleId}`;
}

export function getLessonLearningPath(
  courseId: string,
  lessonId: string,
  contentMode?: LearningContentMode,
): string {
  const base = `/student/learning/${courseId}/lessons/${lessonId}`;
  if (!contentMode) {
    return base;
  }

  const modeParam = learningContentModeToSearchParam(contentMode);
  return `${base}?mode=${modeParam}`;
}

export function getLessonRecordingPath(
  courseId: string,
  lessonId: string,
): string {
  return `/student/learning/${courseId}/lessons/${lessonId}/recording`;
}

export function getLessonQuizPath(courseId: string, lessonId: string): string {
  return `/student/learning/${courseId}/lessons/${lessonId}/quiz`;
}
