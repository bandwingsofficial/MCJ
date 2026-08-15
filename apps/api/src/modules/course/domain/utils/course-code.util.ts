export const COURSE_CODE_PREFIX = 'CR';

const COURSE_CODE_PATTERN = /^CR(\d{4})$/;

export function formatCourseCode(sequence: number): string {
  return `${COURSE_CODE_PREFIX}${String(sequence).padStart(4, '0')}`;
}

export function parseCourseCodeNumber(code: string): number | null {
  const match = code.trim().toUpperCase().match(COURSE_CODE_PATTERN);

  if (!match) {
    return null;
  }

  const value = Number(match[1]);

  return Number.isNaN(value) ? null : value;
}
