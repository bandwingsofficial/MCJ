import {
  type CourseLessonDeleteBlockingDependencies,
  courseLessonHasDeleteBlockingDependencies,
} from '../../domain/types/course-lesson-delete-blocking';

function formatSection(
  heading: string,
  items: { title: string }[],
): string[] {
  if (items.length === 0) {
    return [];
  }

  return [
    `${heading}:`,
    ...items.map((item) => `- ${item.title}`),
    '',
  ];
}

export function formatCourseLessonDeleteBlockingMessage(
  dependencies: CourseLessonDeleteBlockingDependencies,
): string {
  if (!courseLessonHasDeleteBlockingDependencies(dependencies)) {
    return 'This lesson cannot be deleted because it contains dependent content.';
  }

  const sections = [
    'Lesson cannot be deleted because it contains dependent content:',
    '',
    ...formatSection(
      'Self-Paced Videos',
      dependencies.selfPacedVideos,
    ),
    ...formatSection(
      'Learning Content',
      dependencies.learnItems,
    ),
    ...formatSection('Resources', dependencies.resources),
    ...formatSection('Quizzes', dependencies.quizzes),
  ].filter((line, index, arr) => !(line === '' && arr[index + 1] === ''));

  return sections.join('\n').trimEnd();
}
