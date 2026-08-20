export const STUDENT_CODE_PREFIX = 'STU';

const STUDENT_CODE_PATTERN = /^STU(\d{4})$/;

export function formatStudentCode(sequence: number): string {
  return `${STUDENT_CODE_PREFIX}${String(sequence).padStart(4, '0')}`;
}

export function parseStudentCodeNumber(code: string): number | null {
  const match = code.trim().toUpperCase().match(STUDENT_CODE_PATTERN);

  if (!match) {
    return null;
  }

  const value = Number(match[1]);

  return Number.isNaN(value) ? null : value;
}
