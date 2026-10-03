import {
  STUDENT_ENROLLMENT_WORKFLOW_STATUS_LABELS,
  getAllowedNextStudentEnrollmentWorkflowStatuses,
  normalizeStudentEnrollmentWorkflowStatus,
  type StudentEnrollmentWorkflowStatus,
} from "@mcj/shared-constants";

import type { StudentStatus } from "@/src/features/students/types/student.types";

export function normalizeStudentWorkflowStatus(
  status: string | null | undefined,
): StudentEnrollmentWorkflowStatus {
  return normalizeStudentEnrollmentWorkflowStatus(status) ?? "LEAD";
}

export function getStudentStatusChangeOptions(current: StudentStatus): Array<{
  label: string;
  value: StudentStatus;
}> {
  const from = normalizeStudentWorkflowStatus(current);
  const allowed = getAllowedNextStudentEnrollmentWorkflowStatuses(from);

  return allowed.map((value) => ({
    label: STUDENT_ENROLLMENT_WORKFLOW_STATUS_LABELS[value],
    value: value as StudentStatus,
  }));
}

/** Edit/create forms: current value plus valid next statuses. */
export function getStudentStatusSelectOptions(current: StudentStatus): Array<{
  label: string;
  value: StudentStatus;
}> {
  const from = normalizeStudentWorkflowStatus(current);
  const allowed = getAllowedNextStudentEnrollmentWorkflowStatuses(from);

  const values = new Set<StudentEnrollmentWorkflowStatus>([from, ...allowed]);

  return [...values].map((value) => ({
    label: STUDENT_ENROLLMENT_WORKFLOW_STATUS_LABELS[value],
    value: value as StudentStatus,
  }));
}

export function canChangeStudentWorkflowStatus(
  current: StudentStatus,
): boolean {
  const from = normalizeStudentWorkflowStatus(current);
  return getAllowedNextStudentEnrollmentWorkflowStatuses(from).length > 0;
}
