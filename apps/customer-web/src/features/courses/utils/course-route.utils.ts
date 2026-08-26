export function isCourseUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function getCourseDetailPath(course: { slug: string }): string {
  return `/courses/${encodeURIComponent(course.slug)}`;
}

export function getCourseBatchesSectionPath(course: { slug: string }): string {
  return `${getCourseDetailPath(course)}#available-branches`;
}

export function getCourseEnrollPath(
  course: { slug: string },
  options?: { batchId?: string; branchId?: string; courseId?: string },
): string {
  const base = `/courses/${encodeURIComponent(course.slug)}/enroll`;
  const params = new URLSearchParams();

  if (options?.courseId) {
    params.set("courseId", options.courseId);
  }

  if (options?.branchId) {
    params.set("branchId", options.branchId);
  }

  if (options?.batchId) {
    params.set("batchId", options.batchId);
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function getEnrollmentLoginPath(returnPath: string): string {
  const params = new URLSearchParams({
    redirect: returnPath,
  });

  return `/login?${params.toString()}`;
}

export function getEnrollmentRegisterPath(returnPath: string): string {
  const params = new URLSearchParams({
    redirect: returnPath,
  });

  return `/register?${params.toString()}`;
}
