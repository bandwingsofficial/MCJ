import type { CourseModuleDeleteBlockingLesson } from '../../domain/types/course-module-delete-blocking-lesson';

export function formatCourseModuleDeactivateBlockingMessage(
  lessons: CourseModuleDeleteBlockingLesson[],
): string {
  if (lessons.length === 0) {
    return 'This module cannot be deactivated because it contains lessons.';
  }

  const lines = lessons.map((lesson) => `- ${lesson.lessonTitle}`);

  return [
    'Module cannot be deactivated because it contains the following lesson(s):',
    '',
    ...lines,
    '',
    'Remove or reassign those lessons before deactivating the module.',
  ].join('\n');
}
