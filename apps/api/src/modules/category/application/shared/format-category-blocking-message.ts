export function formatCategoryBlockingMessage(
  refs: {
    courses: number;
    enrollments: number;
    articles: number;
  },
  options?: {
    blockingCourseNames?: string[];
  },
): string | null {
  const lines: string[] = [];

  if (refs.courses > 0) {
    const names = options?.blockingCourseNames?.filter(Boolean) ?? [];

    if (names.length > 0) {
      lines.push(
        'This category is currently being used by the following course(s):',
        ...names.map((name) => `• ${name}`),
        'Remove the category from these courses before deleting it.',
      );
    } else {
      lines.push(
        `This category is still referenced by ${refs.courses} course${refs.courses === 1 ? '' : 's'}. Remove the category from those courses before deleting it.`,
      );
    }
  }

  if (refs.enrollments > 0) {
    lines.push(
      `This category is still referenced by ${refs.enrollments} enrollment${refs.enrollments === 1 ? '' : 's'}. Reassign those enrollments before deleting it.`,
    );
  }

  if (refs.articles > 0) {
    lines.push(
      `This category is still referenced by ${refs.articles} article${refs.articles === 1 ? '' : 's'}. Reassign those articles before deleting it.`,
    );
  }

  if (lines.length === 0) {
    return null;
  }

  return lines.join('\n\n');
}
