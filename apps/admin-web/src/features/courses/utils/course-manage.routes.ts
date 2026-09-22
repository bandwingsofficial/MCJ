import type { TabKey } from "@/src/features/courses/components/manage/course-manage-workspace";

export const COURSE_MANAGE_DEFAULT_TAB: TabKey = "overview";

const COURSE_MANAGE_TABS: ReadonlySet<TabKey> = new Set([
  "overview",
  "modules",
  "batches",
  "faq",
]);

export function isCourseManageTab(value: string): value is TabKey {
  return COURSE_MANAGE_TABS.has(value as TabKey);
}

export function courseManagePath(courseId: string): string {
  return `/courses/${courseId}/manage`;
}

export function courseManageTabPath(
  courseId: string,
  tab: TabKey = COURSE_MANAGE_DEFAULT_TAB,
): string {
  const base = courseManagePath(courseId);
  if (tab === COURSE_MANAGE_DEFAULT_TAB) {
    return base;
  }
  return `${base}?tab=${tab}`;
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
