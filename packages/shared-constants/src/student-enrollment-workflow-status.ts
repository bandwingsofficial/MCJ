/** Student lifecycle statuses (admin). No Dropped — use Cancelled. */
export const STUDENT_ENROLLMENT_WORKFLOW_STATUSES = [
  "LEAD",
  "ADVANCED",
  "ADMITTED",
  "COMPLETED",
  "CANCELLED",
  "PLACED",
] as const;

export type StudentEnrollmentWorkflowStatus =
  (typeof STUDENT_ENROLLMENT_WORKFLOW_STATUSES)[number];

const STUDENT_TRANSITIONS: Record<
  StudentEnrollmentWorkflowStatus,
  readonly StudentEnrollmentWorkflowStatus[]
> = {
  LEAD: ["ADVANCED", "ADMITTED"],
  ADVANCED: ["ADMITTED", "CANCELLED"],
  ADMITTED: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["LEAD", "PLACED"],
  CANCELLED: ["LEAD"],
  PLACED: ["COMPLETED", "LEAD"],
};

/** Admin enrollment record statuses (course enrollment row). */
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

  let normalized = String(status).trim().toUpperCase();
  if (normalized === "ENQUIRED") {
    normalized = "LEAD";
  }
  if (normalized === "DROPPED") {
    normalized = "CANCELLED";
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
  CANCELLED: "Cancelled",
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

/** Student workflow targets that mutate a linked enrollment row (not Placed / Lead alone). */
export function studentWorkflowSyncsEnrollmentRow(
  workflow: StudentEnrollmentWorkflowStatus,
): boolean {
  return (
    workflow === "ADVANCED" ||
    workflow === "ADMITTED" ||
    workflow === "COMPLETED" ||
    workflow === "CANCELLED"
  );
}

export function isEnrollmentRecordWorkflowStatus(
  workflow: StudentEnrollmentWorkflowStatus,
): workflow is EnrollmentRecordWorkflowStatus {
  return (
    ENROLLMENT_RECORD_WORKFLOW_STATUSES as readonly string[]
  ).includes(workflow);
}

/** Maps stored enrollment row status to admin Admitted | Completed (or null). */
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
    normalized === "PENDING" ||
    normalized === "PENDING_APPROVAL"
  ) {
    return "ADMITTED";
  }

  return null;
}

/** Admin enrollment row lifecycle (Advanced / Admitted / Completed / Cancelled). */
export const ADMIN_ENROLLMENT_LIFECYCLE_STATUSES = [
  "ADVANCED",
  "ADMITTED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type AdminEnrollmentLifecycleStatus =
  (typeof ADMIN_ENROLLMENT_LIFECYCLE_STATUSES)[number];

export function normalizeAdminEnrollmentRowLifecycle(
  enrollmentStatus: string | null | undefined,
): AdminEnrollmentLifecycleStatus | null {
  if (enrollmentStatus == null) {
    return null;
  }

  const normalized = String(enrollmentStatus).trim().toUpperCase();

  if (normalized === "COMPLETED") {
    return "COMPLETED";
  }

  if (
    normalized === "CANCELLED" ||
    normalized === "DROPPED" ||
    normalized === "REJECTED"
  ) {
    return "CANCELLED";
  }

  if (normalized === "ADVANCED") {
    return "ADVANCED";
  }

  if (
    normalized === "ADMITTED" ||
    normalized === "ACTIVE" ||
    normalized === "PENDING" ||
    normalized === "PENDING_APPROVAL"
  ) {
    return "ADMITTED";
  }

  return null;
}

/** Admin list/actions: enrollment row status only (never student lifecycle). */
export function resolveAdminEnrollmentLifecycleStatus(input: {
  enrollmentStatus: string | null | undefined;
  studentStatus?: string | null;
}): AdminEnrollmentLifecycleStatus | null {
  return normalizeAdminEnrollmentRowLifecycle(input.enrollmentStatus);
}

/** Row actions / Change Status modal: enrollment record status only. */
export function resolveAdminEnrollmentLifecycleForRowActions(input: {
  enrollmentStatus: string | null | undefined;
  studentStatus?: string | null;
  isActive?: boolean;
}): AdminEnrollmentLifecycleStatus | null {
  return normalizeAdminEnrollmentRowLifecycle(input.enrollmentStatus);
}

export const ADMIN_ENROLLMENT_LIFECYCLE_TRANSITIONS: Record<
  AdminEnrollmentLifecycleStatus,
  readonly AdminEnrollmentLifecycleStatus[]
> = {
  ADVANCED: ["ADMITTED", "CANCELLED"],
  ADMITTED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionAdminEnrollmentLifecycle(
  from: AdminEnrollmentLifecycleStatus,
  to: AdminEnrollmentLifecycleStatus,
): boolean {
  if (from === to) {
    return true;
  }

  return ADMIN_ENROLLMENT_LIFECYCLE_TRANSITIONS[from].includes(to);
}

/** Student status after an admin enrollment lifecycle change (not Placed — student-only). */
export function studentStatusAfterAdminEnrollmentLifecycleChange(
  target: AdminEnrollmentLifecycleStatus,
): StudentEnrollmentWorkflowStatus {
  if (target === "CANCELLED") {
    return "LEAD";
  }

  return target;
}

export function adminEnrollmentLifecycleFromWorkflowTarget(
  status: string | null | undefined,
): AdminEnrollmentLifecycleStatus | null {
  const normalized = normalizeStudentEnrollmentWorkflowStatus(status);
  if (
    normalized === "ADVANCED" ||
    normalized === "ADMITTED" ||
    normalized === "COMPLETED" ||
    normalized === "CANCELLED"
  ) {
    return normalized;
  }

  return null;
}

/** Block admin create-enrollment picker only for in-progress admission statuses. */
export function isStudentStatusBlockingNewAdminEnrollment(
  status: string | null | undefined,
): boolean {
  const workflow = normalizeStudentEnrollmentWorkflowStatus(status);
  if (!workflow) {
    return false;
  }

  return workflow === "ADVANCED" || workflow === "ADMITTED";
}

/**
 * Lead, Completed, Cancelled, Placed may start a new enrollment.
 * When `hasOpenEnrollmentSlot` is provided, it wins over student status (handles stale Advanced/Admitted after cancel).
 */
export function canStudentStartNewAdminEnrollment(
  status: string | null | undefined,
  options?: { hasOpenEnrollmentSlot?: boolean },
): boolean {
  if (options?.hasOpenEnrollmentSlot !== undefined) {
    return !options.hasOpenEnrollmentSlot;
  }

  return !isStudentStatusBlockingNewAdminEnrollment(status);
}

export type AdminEnrollmentListTab = "active" | "completed" | "cancelled";

export type StudentManageEnrollmentTab =
  | "all"
  | "active"
  | "completed"
  | "cancelled";

/** Global admin list — active enrollments (Admitted). */
export const ADMIN_ENROLLMENT_ACTIVE_TAB_STATUSES = [
  "ADMITTED",
  "ACTIVE",
  "ADVANCED",
] as const;

export const ADMIN_ENROLLMENT_COMPLETED_TAB_STATUSES = ["COMPLETED"] as const;

export const ADMIN_ENROLLMENT_CANCELLED_TAB_STATUSES = [
  "CANCELLED",
  "DROPPED",
  "REJECTED",
] as const;

export const STUDENT_MANAGE_ENROLLMENT_CANCELLED_STATUSES = [
  "CANCELLED",
  "DROPPED",
  "REJECTED",
] as const;

/** DB partial-unique slot (one open admitted enrollment per student). */
export const ADMIN_ENROLLMENT_UNIQUE_SLOT_STATUSES = [
  "PENDING",
  "PENDING_APPROVAL",
  "ADVANCED",
  "ADMITTED",
  "ACTIVE",
] as const;

export function adminEnrollmentTabStatusIn(
  tab: AdminEnrollmentListTab,
): readonly string[] {
  switch (tab) {
    case "completed":
      return ADMIN_ENROLLMENT_COMPLETED_TAB_STATUSES;
    case "cancelled":
      return ADMIN_ENROLLMENT_CANCELLED_TAB_STATUSES;
    case "active":
    default:
      return ADMIN_ENROLLMENT_ACTIVE_TAB_STATUSES;
  }
}

export function studentManageEnrollmentTabStatusIn(
  tab: StudentManageEnrollmentTab,
): readonly string[] | undefined {
  switch (tab) {
    case "all":
      return undefined;
    case "active":
      return ADMIN_ENROLLMENT_ACTIVE_TAB_STATUSES;
    case "completed":
      return ADMIN_ENROLLMENT_COMPLETED_TAB_STATUSES;
    case "cancelled":
      return STUDENT_MANAGE_ENROLLMENT_CANCELLED_STATUSES;
    default:
      return undefined;
  }
}

export function enrollmentStatusOccupiesUniqueStudentSlot(
  status: string | null | undefined,
): boolean {
  if (status == null || String(status).trim() === "") {
    return false;
  }

  const normalized = String(status).trim().toUpperCase();
  return (ADMIN_ENROLLMENT_UNIQUE_SLOT_STATUSES as readonly string[]).includes(
    normalized,
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
