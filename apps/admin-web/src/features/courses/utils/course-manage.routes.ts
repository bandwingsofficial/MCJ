import type { TabKey } from "@/src/features/courses/components/manage/course-manage-workspace";

export const COURSE_MANAGE_DEFAULT_TAB: TabKey = "overview";

export function courseManagePath(courseId: string): string {
  return `/courses/${courseId}/manage`;
}

export function courseManageModulePath(
  courseId: string,
  moduleId: string,
): string {
  return `${courseManagePath(courseId)}/modules/${moduleId}`;
}

export function courseManageLessonPath(
  courseId: string,
  moduleId: string,
  lessonId: string,
): string {
  return `${courseManageModulePath(courseId, moduleId)}/lessons/${lessonId}/manage`;
}

export function courseManageLessonQuizPath(
  courseId: string,
  moduleId: string,
  lessonId: string,
): string {
  return `${courseManageModulePath(courseId, moduleId)}/lessons/${lessonId}/quiz`;
}

export function coursePreviewPath(courseId: string): string {
  return `/courses/${courseId}/preview`;
}
