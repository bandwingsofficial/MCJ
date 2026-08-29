/** Formats a per-batch session sequence as S01, S02, … */
export function formatBatchSessionCode(sessionNumber: number): string {
  if (!Number.isFinite(sessionNumber) || sessionNumber < 1) {
    return '';
  }

  return `S${String(Math.trunc(sessionNumber)).padStart(2, '0')}`;
}

/** Display label used across Admin, Branch, and Enrollment. */
export function formatSessionCourseLabel(
  sessionCode: string | null | undefined,
  courseTitle: string,
): string {
  const title = courseTitle.trim();
  const code = sessionCode?.trim();

  if (!code) {
    return title;
  }

  return title ? `${code} - ${title}` : code;
}
