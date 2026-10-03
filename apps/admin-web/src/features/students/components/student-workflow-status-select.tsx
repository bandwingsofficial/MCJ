"use client";

import { AppSelect } from "@/src/shared/components/ui/select";

import type { StudentStatus } from "@/src/features/students/types/student.types";
import {
  canChangeStudentWorkflowStatus,
  getStudentStatusSelectOptions,
  normalizeStudentWorkflowStatus,
} from "@/src/features/students/utils/student-workflow-status.utils";
import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";

interface StudentWorkflowStatusSelectProps {
  status: StudentStatus;
  disabled?: boolean;
  loading?: boolean;
  onChange?: (status: StudentStatus) => void;
}

export function StudentWorkflowStatusSelect({
  status,
  disabled,
  loading,
  onChange,
}: StudentWorkflowStatusSelectProps) {
  const normalized = normalizeStudentWorkflowStatus(status);
  const canChange = canChangeStudentWorkflowStatus(normalized);

  if (!canChange || disabled || loading || !onChange) {
    return <StudentStatusBadge status={normalized} />;
  }

  return (
    <AppSelect
      value={normalized}
      options={getStudentStatusSelectOptions(normalized)}
      onValueChange={(value) => onChange(value as StudentStatus)}
      triggerClassName="h-8 min-w-[8.5rem] text-xs"
    />
  );
}
