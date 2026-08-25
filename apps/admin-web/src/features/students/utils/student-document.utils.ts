import { STUDENT_DOCUMENT_TYPE_OPTIONS } from "@/src/features/students/constants/student.constants";
import type { StudentDocumentType } from "@/src/features/students/types/student.types";

export function formatStudentDocumentType(
  type: StudentDocumentType,
): string {
  return (
    STUDENT_DOCUMENT_TYPE_OPTIONS.find((option) => option.value === type)
      ?.label ?? type
  );
}

export function formatStudentFileSize(bytes?: number | null): string {
  if (bytes == null || Number.isNaN(bytes)) {
    return "—";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
