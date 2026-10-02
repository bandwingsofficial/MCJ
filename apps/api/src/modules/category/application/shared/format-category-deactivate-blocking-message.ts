import { formatCategoryCourseBlockingMessage } from './format-category-course-blocking-message';

export function formatCategoryDeactivateBlockingMessage(
  blockingCourseNames: string[],
  courseCount: number,
): string {
  return formatCategoryCourseBlockingMessage(
    'deactivate',
    blockingCourseNames,
    courseCount,
  );
}

export function formatCategoryArchiveBlockingMessage(
  blockingCourseNames: string[],
  courseCount: number,
): string {
  return formatCategoryCourseBlockingMessage(
    'archive',
    blockingCourseNames,
    courseCount,
  );
}