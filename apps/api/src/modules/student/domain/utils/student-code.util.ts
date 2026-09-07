export function formatStudentCode(sequence: number): string {
  return `MCJ-STU-${String(sequence).padStart(3, '0')}`;
}

export function parseStudentCodeNumber(code: string): number | null {
  const normalized = code.trim().toUpperCase();

  const mcjMatch = normalized.match(/^MCJ-STU-(\d+)$/);
  if (mcjMatch) {
    const value = Number(mcjMatch[1]);
    return Number.isNaN(value) ? null : value;
  }

  const legacyMatch = normalized.match(/^STU(\d+)$/);
  if (legacyMatch) {
    const value = Number(legacyMatch[1]);
    return Number.isNaN(value) ? null : value;
  }

  return null;
}
