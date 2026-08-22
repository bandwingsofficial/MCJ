export function isCourseUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function getCourseDetailPath(course: { slug: string }): string {
  return `/courses/${encodeURIComponent(course.slug)}`;
}

export function getCourseEnrollPath(course: { slug: string }): string {
  return `/courses/${encodeURIComponent(course.slug)}/enroll`;
}
