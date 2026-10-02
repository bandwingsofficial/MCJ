import type { CourseModuleDeleteBlockingLesson } from '../../domain/types/course-module-delete-blocking-lesson';

export function formatCourseModuleDeleteBlockingMessage(
  lessons: CourseModuleDeleteBlockingLesson[],
): string {
  if (lessons.length === 0) {
    return 'This module cannot be deleted because it contains lessons.';
  }

  const lines = lessons.map((lesson) => `- ${lesson.lessonTitle}`);

  return [
    'This module cannot be deleted because it contains the following lesson(s):',
    '',
    ...lines,
    '',
    'Remove or reassign those lessons before deleting the module.',
  ].join('\n');
}
