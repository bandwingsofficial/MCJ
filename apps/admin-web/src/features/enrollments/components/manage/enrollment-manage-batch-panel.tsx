"use client";

import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { EnrollmentManageBatchDetails } from "@/src/features/enrollments/components/manage/enrollment-manage-batch-details";

interface Props {
  enrollment: Enrollment;
}

export function EnrollmentManageBatchPanel({ enrollment }: Props) {
  return <EnrollmentManageBatchDetails enrollment={enrollment} />;
}
