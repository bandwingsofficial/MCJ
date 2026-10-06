import type { BatchMode } from "@/src/features/batches/types/batch.types";
import { EnrollmentMode } from "@/src/features/enrollments/types/enrollment.enums";

export function batchModeToEnrollmentMode(
  mode: BatchMode | string | null | undefined,
): EnrollmentMode | undefined {
  if (mode === "OFFLINE") {
    return EnrollmentMode.OFFLINE;
  }

  if (mode === "ONLINE") {
    return EnrollmentMode.ONLINE;
  }

  if (
    mode === "RECORDED" ||
    mode === "SELF_PACED" ||
    mode === "SELF_PACED_RECORDED"
  ) {
    return EnrollmentMode.SELF_PACED_RECORDED;
  }

  return undefined;
}

export function enrollmentModeToBatchMode(
  mode: string | null | undefined,
): BatchMode | "" {
  if (
    mode === "SELF_PACED_RECORDED" ||
    mode === "SELF_PACED" ||
    mode === "RECORDED"
  ) {
    return "RECORDED";
  }

  if (mode === "ONLINE" || mode === "OFFLINE") {
    return mode;
  }

  return "";
}
