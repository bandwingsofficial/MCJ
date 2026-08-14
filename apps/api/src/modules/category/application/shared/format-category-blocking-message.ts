export function formatCategoryBlockingMessage(refs: {
  courses: number;
  enrollments: number;
  articles: number;
}): string | null {
  const parts: string[] = [];

  if (refs.courses > 0) {
    parts.push(
      `${refs.courses} course${refs.courses === 1 ? '' : 's'}`,
    );
  }

  if (refs.enrollments > 0) {
    parts.push(
      `${refs.enrollments} enrollment${refs.enrollments === 1 ? '' : 's'}`,
    );
  }

  if (refs.articles > 0) {
    parts.push(
      `${refs.articles} article${refs.articles === 1 ? '' : 's'}`,
    );
  }

  if (parts.length === 0) {
    return null;
  }

  return `Cannot permanently delete this category because it is still referenced by ${parts.join(', ')}. Reassign those records to another category first.`;
}
