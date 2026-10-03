"use client";

import { AppSelect } from "@/src/shared/components/ui/select";

import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/table/EnrollmentStatusBadge";
import { EnrollmentStatus } from "@/src/features/enrollments/types/enrollment.enums";
import {
  canChangeEnrollmentWorkflowStatus,
  getEnrollmentStatusSelectOptions,
  resolveEnrollmentWorkflowStatus,
  enrollmentWorkflowStatusToEnrollmentStatus,
} from "@/src/features/enrollments/utils/enrollment-workflow-status.utils";
import { normalizeStudentWorkflowStatus } from "@/src/features/students/utils/student-workflow-status.utils";

interface EnrollmentWorkflowStatusSelectProps {
  enrollmentStatus: EnrollmentStatus;
  studentStatus?: string | null;
  disabled?: boolean;
  loading?: boolean;
  onChange: (status: EnrollmentStatus) => void;
}

export function EnrollmentWorkflowStatusSelect({
  enrollmentStatus,
  studentStatus,
  disabled,
  loading,
  onChange,
}: EnrollmentWorkflowStatusSelectProps) {
  const workflow = studentStatus
    ? normalizeStudentWorkflowStatus(studentStatus)
    : resolveEnrollmentWorkflowStatus(enrollmentStatus);

  const displayStatus = enrollmentWorkflowStatusToEnrollmentStatus(workflow);
  const canChange = canChangeEnrollmentWorkflowStatus(displayStatus);

  if (!canChange || disabled || loading) {
    return <EnrollmentStatusBadge status={displayStatus} />;
  }

  return (
    <AppSelect
      value={displayStatus}
      options={getEnrollmentStatusSelectOptions(displayStatus)}
      onValueChange={(value) => onChange(value as EnrollmentStatus)}
      triggerClassName="h-8 min-w-[8.5rem] text-xs"
    />
  );
}
