/** Student / enrollment workflow statuses (aligned with StudentStatus, excluding ENQUIRED). */
export const STUDENT_ENROLLMENT_WORKFLOW_STATUSES = [
  "LEAD",
  "ADVANCED",
  "ADMITTED",
  "COMPLETED",
  "DROPPED",
  "PLACED",
] as const;

export type StudentEnrollmentWorkflowStatus =
  (typeof STUDENT_ENROLLMENT_WORKFLOW_STATUSES)[number];

const STUDENT_TRANSITIONS: Record<
  StudentEnrollmentWorkflowStatus,
  readonly StudentEnrollmentWorkflowStatus[]
> = {
  LEAD: ["PLACED"],
  ADVANCED: ["LEAD", "PLACED", "DROPPED"],
  ADMITTED: ["LEAD", "ADVANCED", "COMPLETED", "PLACED", "DROPPED"],
  COMPLETED: ["LEAD", "PLACED"],
  DROPPED: ["LEAD"],
  PLACED: ["LEAD"],
};

/** Admin enrollment records: Admitted and Completed only. */
export const ENROLLMENT_RECORD_WORKFLOW_STATUSES = [
  "ADMITTED",
  "COMPLETED",
] as const;

export type EnrollmentRecordWorkflowStatus =
  (typeof ENROLLMENT_RECORD_WORKFLOW_STATUSES)[number];

const ENROLLMENT_RECORD_TRANSITIONS: Record<
  EnrollmentRecordWorkflowStatus,
  readonly EnrollmentRecordWorkflowStatus[]
> = {
  ADMITTED: ["COMPLETED"],
  COMPLETED: [],
};

export function normalizeStudentEnrollmentWorkflowStatus(
  status: string | null | undefined,
): StudentEnrollmentWorkflowStatus | null {
  if (status == null) {
    return null;
  }

  const normalized = String(status).trim().toUpperCase();
  if (normalized === "ENQUIRED") {
    return "LEAD";
  }

  if (
    (STUDENT_ENROLLMENT_WORKFLOW_STATUSES as readonly string[]).includes(
      normalized,
    )
  ) {
    return normalized as StudentEnrollmentWorkflowStatus;
  }

  return null;
}

export function canTransitionStudentEnrollmentWorkflowStatus(
  from: StudentEnrollmentWorkflowStatus,
  to: StudentEnrollmentWorkflowStatus,
): boolean {
  if (from === to) {
    return true;
  }

  return STUDENT_TRANSITIONS[from].includes(to);
}

export function getAllowedNextStudentEnrollmentWorkflowStatuses(
  from: StudentEnrollmentWorkflowStatus,
): readonly StudentEnrollmentWorkflowStatus[] {
  return STUDENT_TRANSITIONS[from];
}

export function canTransitionEnrollmentRecordStatus(
  from: EnrollmentRecordWorkflowStatus,
  to: EnrollmentRecordWorkflowStatus,
): boolean {
  if (from === to) {
    return true;
  }

  return ENROLLMENT_RECORD_TRANSITIONS[from].includes(to);
}

export function getAllowedNextEnrollmentRecordStatuses(
  from: EnrollmentRecordWorkflowStatus,
): readonly EnrollmentRecordWorkflowStatus[] {
  return ENROLLMENT_RECORD_TRANSITIONS[from];
}

export const STUDENT_ENROLLMENT_WORKFLOW_STATUS_LABELS: Record<
  StudentEnrollmentWorkflowStatus,
  string
> = {
  LEAD: "Lead",
  ADVANCED: "Advanced",
  ADMITTED: "Admitted",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
  PLACED: "Placed",
};

export const ENROLLMENT_RECORD_STATUS_LABELS: Record<
  EnrollmentRecordWorkflowStatus,
  string
> = {
  ADMITTED: "Admitted",
  COMPLETED: "Completed",
};

export function mapWorkflowStatusToEnrollmentRecordStatus(
  workflow: StudentEnrollmentWorkflowStatus,
): EnrollmentRecordWorkflowStatus | null {
  if (workflow === "ADMITTED") {
    return "ADMITTED";
  }
  if (workflow === "COMPLETED") {
    return "COMPLETED";
  }
  return null;
}

export function isEnrollmentRecordWorkflowStatus(
  workflow: StudentEnrollmentWorkflowStatus,
): workflow is EnrollmentRecordWorkflowStatus {
  return (
    ENROLLMENT_RECORD_WORKFLOW_STATUSES as readonly string[]
  ).includes(workflow);
}

/** Maps stored enrollment row status to admin Admitted | Completed (or null if not applicable). */
export function normalizeEnrollmentRecordLifecycleStatus(
  status: string | null | undefined,
): EnrollmentRecordWorkflowStatus | null {
  if (status == null) {
    return null;
  }

  const normalized = String(status).trim().toUpperCase();

  if (normalized === "COMPLETED") {
    return "COMPLETED";
  }

  if (
    normalized === "ADMITTED" ||
    normalized === "ACTIVE" ||
    normalized === "ADVANCED" ||
    normalized === "LEAD" ||
    normalized === "PLACED" ||
    normalized === "ENQUIRED" ||
    normalized === "PENDING" ||
    normalized === "PENDING_APPROVAL"
  ) {
    return "ADMITTED";
  }

  return null;
}

/** Primary admin lifecycle from enrollment rows (Completed wins over Admitted). */
/** Admin create enrollment: allowed when student is Lead, Completed, Dropped, or Placed. */
export function canStudentStartNewAdminEnrollment(
  status: string | null | undefined,
): boolean {
  const workflow = normalizeStudentEnrollmentWorkflowStatus(status);
  if (!workflow) {
    return true;
  }

  return (
    workflow === "LEAD" ||
    workflow === "COMPLETED" ||
    workflow === "DROPPED" ||
    workflow === "PLACED"
  );
}

export function resolveLifecycleStatusFromEnrollmentStatuses(
  statuses: readonly string[],
): EnrollmentRecordWorkflowStatus | null {
  const lifecycles = statuses
    .map((status) => normalizeEnrollmentRecordLifecycleStatus(status))
    .filter((status): status is EnrollmentRecordWorkflowStatus =>
      Boolean(status),
    );

  if (lifecycles.length === 0) {
    return null;
  }

  if (lifecycles.some((status) => status === "COMPLETED")) {
    return "COMPLETED";
  }

  return "ADMITTED";
}
