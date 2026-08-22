import type { TabKey } from "@/src/features/students/components/manage/student-manage-workspace";

export const STUDENT_MANAGE_DEFAULT_TAB: TabKey = "overview";

export function studentManagePath(studentId: string): string {
  return `/students/${studentId}/manage`;
}

export function studentManageTabPath(
  studentId: string,
  tab: TabKey,
): string {
  if (tab === STUDENT_MANAGE_DEFAULT_TAB) {
    return studentManagePath(studentId);
  }

  return `${studentManagePath(studentId)}?tab=${tab}`;
}
