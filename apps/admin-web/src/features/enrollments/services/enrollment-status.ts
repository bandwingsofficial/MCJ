// src/features/enrollments/services/enrollment-status.ts

import {
  canTransitionStudentEnrollmentWorkflowStatus,
} from "@mcj/shared-constants";

import { EnrollmentStatus } from "../types";
import {
  resolveEnrollmentWorkflowStatus,
  enrollmentWorkflowStatusToEnrollmentStatus,
} from "../utils/enrollment-workflow-status.utils";

export const canUpdateStatus = (
  current: EnrollmentStatus,
  next: EnrollmentStatus,
): boolean => {
  const from = resolveEnrollmentWorkflowStatus(current);
  const to = resolveEnrollmentWorkflowStatus(next);

  return canTransitionStudentEnrollmentWorkflowStatus(from, to);
};

export function toWorkflowEnrollmentStatus(
  status: EnrollmentStatus,
): EnrollmentStatus {
  return enrollmentWorkflowStatusToEnrollmentStatus(
    resolveEnrollmentWorkflowStatus(status),
  );
}
