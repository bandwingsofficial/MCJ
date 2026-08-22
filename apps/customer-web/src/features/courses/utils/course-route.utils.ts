export function isCourseUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function getCourseDetailPath(course: { id: string }): string {
  return `/courses/${course.id}`;
}

export function getCourseEnrollPath(course: { id: string }): string {
  return `/courses/${course.id}/enroll`;
}
