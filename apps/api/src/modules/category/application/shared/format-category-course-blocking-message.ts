export type CategoryCourseBlockAction = 'deactivate' | 'archive';

export function formatCategoryCourseBlockingMessage(
  action: CategoryCourseBlockAction,
  blockingCourseNames: string[],
  courseCount: number,
): string {
  const verb = action === 'deactivate' ? 'deactivating' : 'archiving';
  const names = blockingCourseNames.filter(Boolean);

  if (names.length > 0) {
    return [
      'This category is currently used by:',
      ...names.map((name) => `• ${name}`),
      `Remove the category from these courses before ${verb} it.`,
    ].join('\n');
  }

  if (courseCount === 1) {
    return `This category is currently used by 1 course. Remove the category from that course before ${verb} it.`;
  }

  return `This category is currently used by ${courseCount} courses. Remove the category from those courses before ${verb} it.`;
}
