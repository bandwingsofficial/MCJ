export interface StudentAdmittedEnrollmentBlock {
  studentId: string;
  studentName: string;
  enrollmentId: string;
  branchId: string;
  branchName: string;
  courseId: string;
  courseTitle: string;
  status: string;
}

export function buildStudentDeleteBlockedTitle(bulk: boolean): string {
  return bulk
    ? "Cannot delete selected students"
    : "Cannot delete student";
}

export function formatStudentAdmittedEnrollmentBlockDescription(
  blocks: StudentAdmittedEnrollmentBlock[],
): string {
  if (blocks.length === 0) {
    return "";
  }

  const byStudent = new Map<
    string,
    { studentName: string; lines: string[] }
  >();

  for (const block of blocks) {
    const detail = `${block.branchName} — ${block.courseTitle} (${block.status})`;
    const existing = byStudent.get(block.studentId);

    if (existing) {
      if (!existing.lines.includes(detail)) {
        existing.lines.push(detail);
      }
      continue;
    }

    byStudent.set(block.studentId, {
      studentName: block.studentName,
      lines: [detail],
    });
  }

  const lines: string[] = [
    "Delete is blocked while a student has an enrollment with ADMITTED status.",
    "",
  ];

  for (const entry of byStudent.values()) {
    lines.push(`• ${entry.studentName}: ${entry.lines.join("; ")}`);
  }

  return lines.join("\n");
}
