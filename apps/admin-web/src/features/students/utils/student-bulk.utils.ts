import type { Student } from "@/src/features/students/types/student.types";

export function isArchivedStudent(student: Student): boolean {
  return Boolean(student.deletedAt || student.isDeleted);
}

export function getEligibleActivateIds(
  students: Student[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return students
    .filter(
      (student) =>
        selected.has(student.id) &&
        !isArchivedStudent(student) &&
        student.isActive === false,
    )
    .map((student) => student.id);
}

export function getEligibleDeactivateIds(
  students: Student[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return students
    .filter(
      (student) =>
        selected.has(student.id) &&
        !isArchivedStudent(student) &&
        student.isActive !== false,
    )
    .map((student) => student.id);
}

export function getEligibleDeleteIds(
  students: Student[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return students
    .filter((student) => selected.has(student.id) && !isArchivedStudent(student))
    .map((student) => student.id);
}

export function getEligibleRestoreIds(
  students: Student[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return students
    .filter((student) => selected.has(student.id) && isArchivedStudent(student))
    .map((student) => student.id);
}

export function getEligiblePermanentDeleteIds(
  students: Student[],
  selectedIds: string[],
): string[] {
  return getEligibleRestoreIds(students, selectedIds);
}

export function formatBulkResultToast(
  result: { successCount: number; failedCount: number },
  successLabel: string,
): string {
  if (result.failedCount === 0) {
    return `${result.successCount} ${successLabel}`;
  }

  return `${result.successCount} ${successLabel}. ${result.failedCount} failed.`;
}
