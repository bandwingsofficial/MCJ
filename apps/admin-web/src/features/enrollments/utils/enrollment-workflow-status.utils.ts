import {
  ENROLLMENT_RECORD_STATUS_LABELS,
  ENROLLMENT_RECORD_WORKFLOW_STATUSES,
  getAllowedNextEnrollmentRecordStatuses,
  STUDENT_ENROLLMENT_WORKFLOW_STATUS_LABELS,
  ADMIN_ENROLLMENT_LIFECYCLE_TRANSITIONS,
  adminEnrollmentLifecycleFromWorkflowTarget,
  resolveAdminEnrollmentLifecycleStatus,
  resolveAdminEnrollmentLifecycleForRowActions,
  type AdminEnrollmentLifecycleStatus,
  isEnrollmentRecordWorkflowStatus,
  mapWorkflowStatusToEnrollmentRecordStatus,
  normalizeEnrollmentRecordLifecycleStatus,
  normalizeStudentEnrollmentWorkflowStatus,
  type AdminEnrollmentListTab,
  type EnrollmentRecordWorkflowStatus,
  type StudentEnrollmentWorkflowStatus,
} from "@mcj/shared-constants";

import { EnrollmentStatus } from "@/src/features/enrollments/types/enrollment.enums";

export const ENROLLMENT_ADMIN_STATUS_LABELS: Record<
  EnrollmentStatus.JOINED | EnrollmentStatus.COMPLETED,
  string
> = {
  [EnrollmentStatus.JOINED]: ENROLLMENT_RECORD_STATUS_LABELS.JOINED,
  [EnrollmentStatus.COMPLETED]: ENROLLMENT_RECORD_STATUS_LABELS.COMPLETED,
};

export function resolveEnrollmentWorkflowStatus(
  enrollmentStatus: EnrollmentStatus | string,
): StudentEnrollmentWorkflowStatus {
  switch (enrollmentStatus) {
    case EnrollmentStatus.ENROLLED:
      return "ENROLLED";
    case EnrollmentStatus.JOINED:
    case EnrollmentStatus.ACTIVE:
      return "JOINED";
    case EnrollmentStatus.COMPLETED:
      return "COMPLETED";
    case EnrollmentStatus.DROPPED:
      return "CANCELLED";
    case EnrollmentStatus.PLACED:
      return "PLACED";
    case EnrollmentStatus.LEAD:
    case EnrollmentStatus.PENDING:
    case EnrollmentStatus.PENDING_APPROVAL:
    case EnrollmentStatus.CANCELLED:
    case EnrollmentStatus.REJECTED:
      return "CANCELLED";
    default:
      return "LEAD";
  }
}

export function enrollmentRecordWorkflowToEnrollmentStatus(
  workflow: EnrollmentRecordWorkflowStatus,
): EnrollmentAdminDisplayStatus {
  switch (workflow) {
    case "JOINED":
      return EnrollmentStatus.JOINED;
    case "COMPLETED":
      return EnrollmentStatus.COMPLETED;
    default:
      return EnrollmentStatus.JOINED;
  }
}

/** Admin table/dialog: Joined | Completed only. */
export type EnrollmentAdminDisplayStatus =
  | EnrollmentStatus.JOINED
  | EnrollmentStatus.COMPLETED;

export function resolveEnrollmentAdminDisplayStatus(input: {
  enrollmentStatus: EnrollmentStatus | string;
  studentStatus?: string | null;
}): EnrollmentAdminDisplayStatus {
  const fromEnrollment = normalizeEnrollmentRecordLifecycleStatus(
    input.enrollmentStatus,
  );

  if (fromEnrollment) {
    return enrollmentRecordWorkflowToEnrollmentStatus(fromEnrollment);
  }

  return EnrollmentStatus.JOINED;
}

export function resolveEnrollmentListWorkflowStatus(input: {
  enrollmentStatus: EnrollmentStatus | string;
  studentStatus?: string | null;
}): StudentEnrollmentWorkflowStatus {
  const lifecycle = resolveAdminEnrollmentLifecycleStatus({
    enrollmentStatus: input.enrollmentStatus,
    studentStatus: input.studentStatus,
  });

  if (lifecycle) {
    return lifecycle;
  }

  return resolveEnrollmentWorkflowStatus(input.enrollmentStatus);
}

export function workflowStatusToEnrollmentStatus(
  workflow: StudentEnrollmentWorkflowStatus,
): EnrollmentStatus {
  switch (workflow) {
    case "LEAD":
      return EnrollmentStatus.LEAD;
    case "ENROLLED":
      return EnrollmentStatus.ENROLLED;
    case "JOINED":
      return EnrollmentStatus.JOINED;
    case "COMPLETED":
      return EnrollmentStatus.COMPLETED;
    case "CANCELLED":
      return EnrollmentStatus.CANCELLED;
    case "PLACED":
      return EnrollmentStatus.PLACED;
    default:
      return EnrollmentStatus.LEAD;
  }
}

export function isEnrollmentVisibleInAdminList(input: {
  enrollmentStatus: EnrollmentStatus | string;
  studentStatus?: string | null;
}): boolean {
  const workflow = resolveEnrollmentListWorkflowStatus(input);
  return (
    workflow === "ENROLLED" ||
    workflow === "JOINED" ||
    workflow === "COMPLETED"
  );
}

export function resolveSyncedLifecycleWorkflow(input: {
  enrollmentStatus: EnrollmentStatus | string;
  studentStatus?: string | null;
}): EnrollmentRecordWorkflowStatus {
  const workflow = resolveEnrollmentListWorkflowStatus(input);
  const record = mapWorkflowStatusToEnrollmentRecordStatus(workflow);

  if (record) {
    return record;
  }

  return "COMPLETED";
}

export function getEnrollmentStatusChangeOptions(
  workflow: EnrollmentRecordWorkflowStatus,
): Array<{ label: string; value: EnrollmentAdminDisplayStatus }> {
  const allowed = getAllowedNextEnrollmentRecordStatuses(workflow);

  return allowed.map((value) => {
    const status = enrollmentRecordWorkflowToEnrollmentStatus(value);
    return {
      label: ENROLLMENT_ADMIN_STATUS_LABELS[status],
      value: status,
    };
  });
}

const LIFECYCLE_STATUS_LABELS: Record<
  AdminEnrollmentLifecycleStatus,
  string
> = {
  ENROLLED: "Enrolled",
  JOINED: "Joined",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function lifecycleToEnrollmentStatus(
  lifecycle: AdminEnrollmentLifecycleStatus,
): EnrollmentStatus {
  switch (lifecycle) {
    case "ENROLLED":
      return EnrollmentStatus.ENROLLED;
    case "JOINED":
      return EnrollmentStatus.JOINED;
    case "COMPLETED":
      return EnrollmentStatus.COMPLETED;
    case "CANCELLED":
      return EnrollmentStatus.CANCELLED;
    default:
      return EnrollmentStatus.JOINED;
  }
}

export type EnrollmentRowWorkflowInput = {
  enrollmentStatus: EnrollmentStatus | string;
  studentStatus?: string | null;
  isActive?: boolean;
};

export function getEnrollmentWorkflowStatusChangeOptions(
  input: EnrollmentRowWorkflowInput,
): Array<{ label: string; value: EnrollmentStatus }> {
  const current = resolveAdminEnrollmentLifecycleForRowActions({
    enrollmentStatus: input.enrollmentStatus,
    isActive: input.isActive,
  });

  if (!current) {
    return [];
  }

  if (current === "COMPLETED") {
    return [
      {
        label: STUDENT_ENROLLMENT_WORKFLOW_STATUS_LABELS.PLACED,
        value: EnrollmentStatus.PLACED,
      },
    ];
  }

  return ADMIN_ENROLLMENT_LIFECYCLE_TRANSITIONS[current].map((lifecycle) => ({
    label: LIFECYCLE_STATUS_LABELS[lifecycle],
    value: lifecycleToEnrollmentStatus(lifecycle),
  }));
}

export function adminEnrollmentListTabForWorkflow(
  workflow: StudentEnrollmentWorkflowStatus,
): AdminEnrollmentListTab {
  if (workflow === "COMPLETED" || workflow === "PLACED") {
    return "completed";
  }
  if (workflow === "CANCELLED") {
    return "cancelled";
  }
  return "active";
}

export function adminEnrollmentListTabAfterStatusChange(
  nextStatus: EnrollmentStatus,
): AdminEnrollmentListTab {
  if (nextStatus === EnrollmentStatus.PLACED) {
    return "completed";
  }

  const lifecycle = adminEnrollmentLifecycleFromWorkflowTarget(nextStatus);
  if (lifecycle === "COMPLETED") {
    return "completed";
  }
  if (lifecycle === "CANCELLED") {
    return "cancelled";
  }
  return "active";
}

export function getEnrollmentStatusSelectOptions(
  currentEnrollmentStatus: EnrollmentStatus,
): Array<{ label: string; value: EnrollmentStatus }> {
  const lifecycle =
    normalizeEnrollmentRecordLifecycleStatus(currentEnrollmentStatus) ??
    "JOINED";
  return getEnrollmentStatusChangeOptions(lifecycle);
}

export function canChangeEnrollmentWorkflowStatus(
  currentEnrollmentStatus: EnrollmentStatus,
): boolean {
  const lifecycle =
    normalizeEnrollmentRecordLifecycleStatus(currentEnrollmentStatus) ??
    "JOINED";
  return getEnrollmentStatusChangeOptions(lifecycle).length > 0;
}

export function canChangeEnrollmentRowWorkflowStatus(
  input: EnrollmentRowWorkflowInput,
): boolean {
  return getEnrollmentWorkflowStatusChangeOptions(input).length > 0;
}

/** @deprecated Use canChangeEnrollmentRowWorkflowStatus */
export function canChangeSyncedEnrollmentWorkflowStatus(
  input: EnrollmentRowWorkflowInput,
): boolean {
  return canChangeEnrollmentRowWorkflowStatus(input);
}

export function isAdmittedWorkflowEnrollment(input: {
  enrollmentStatus: EnrollmentStatus | string;
  studentStatus?: string | null;
  isActive?: boolean;
}): boolean {
  const workflow = resolveEnrollmentListWorkflowStatus(input);

  if (workflow !== "JOINED") {
    return false;
  }

  if (input.isActive === false) {
    return false;
  }

  return true;
}

/** @deprecated Use enrollmentRecordWorkflowToEnrollmentStatus. */
export function enrollmentWorkflowStatusToEnrollmentStatus(
  workflow: StudentEnrollmentWorkflowStatus,
): EnrollmentStatus {
  const mapped = mapWorkflowStatusToEnrollmentRecordStatus(workflow);

  if (mapped) {
    return enrollmentRecordWorkflowToEnrollmentStatus(mapped);
  }

  return EnrollmentStatus.JOINED;
}

export { ENROLLMENT_RECORD_WORKFLOW_STATUSES, isEnrollmentRecordWorkflowStatus };
