import {

  ENROLLMENT_RECORD_STATUS_LABELS,

  ENROLLMENT_RECORD_WORKFLOW_STATUSES,

  getAllowedNextEnrollmentRecordStatuses,

  isEnrollmentRecordWorkflowStatus,

  mapWorkflowStatusToEnrollmentRecordStatus,

  normalizeEnrollmentRecordLifecycleStatus,

  normalizeStudentEnrollmentWorkflowStatus,

  resolveLifecycleStatusFromEnrollmentStatuses,

  type EnrollmentRecordWorkflowStatus,

  type StudentEnrollmentWorkflowStatus,

} from "@mcj/shared-constants";



import { EnrollmentStatus } from "@/src/features/enrollments/types/enrollment.enums";



export const ENROLLMENT_ADMIN_STATUS_LABELS: Record<

  EnrollmentStatus.ADMITTED | EnrollmentStatus.COMPLETED,

  string

> = {

  [EnrollmentStatus.ADMITTED]: ENROLLMENT_RECORD_STATUS_LABELS.ADMITTED,

  [EnrollmentStatus.COMPLETED]: ENROLLMENT_RECORD_STATUS_LABELS.COMPLETED,

};



export function resolveEnrollmentWorkflowStatus(

  enrollmentStatus: EnrollmentStatus | string,

): StudentEnrollmentWorkflowStatus {

  switch (enrollmentStatus) {

    case EnrollmentStatus.ADVANCED:

      return "ADVANCED";

    case EnrollmentStatus.ADMITTED:

    case EnrollmentStatus.ACTIVE:

      return "ADMITTED";

    case EnrollmentStatus.COMPLETED:

      return "COMPLETED";

    case EnrollmentStatus.DROPPED:

      return "DROPPED";

    case EnrollmentStatus.PLACED:

      return "PLACED";

    case EnrollmentStatus.LEAD:

    case EnrollmentStatus.PENDING:

    case EnrollmentStatus.PENDING_APPROVAL:

    case EnrollmentStatus.CANCELLED:

    case EnrollmentStatus.REJECTED:

      return "LEAD";

    default:

      return "LEAD";

  }

}



export function enrollmentRecordWorkflowToEnrollmentStatus(

  workflow: EnrollmentRecordWorkflowStatus,

): EnrollmentAdminDisplayStatus {

  switch (workflow) {

    case "ADMITTED":

      return EnrollmentStatus.ADMITTED;

    case "COMPLETED":

      return EnrollmentStatus.COMPLETED;

    default:

      return EnrollmentStatus.ADMITTED;

  }

}



/** Admin table/dialog: Admitted | Completed only. */

export type EnrollmentAdminDisplayStatus =

  | EnrollmentStatus.ADMITTED

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



  return EnrollmentStatus.ADMITTED;

}



/** Single source of truth: linked student status, else enrollment row. */
export function resolveEnrollmentListWorkflowStatus(input: {
  enrollmentStatus: EnrollmentStatus | string;
  studentStatus?: string | null;
}): StudentEnrollmentWorkflowStatus {
  if (input.studentStatus) {
    return (
      normalizeStudentEnrollmentWorkflowStatus(input.studentStatus) ?? "LEAD"
    );
  }

  return resolveEnrollmentWorkflowStatus(input.enrollmentStatus);
}

export function workflowStatusToEnrollmentStatus(
  workflow: StudentEnrollmentWorkflowStatus,
): EnrollmentStatus {
  switch (workflow) {
    case "LEAD":
      return EnrollmentStatus.LEAD;
    case "ADVANCED":
      return EnrollmentStatus.ADVANCED;
    case "ADMITTED":
      return EnrollmentStatus.ADMITTED;
    case "COMPLETED":
      return EnrollmentStatus.COMPLETED;
    case "DROPPED":
      return EnrollmentStatus.DROPPED;
    case "PLACED":
      return EnrollmentStatus.PLACED;
    default:
      return EnrollmentStatus.LEAD;
  }
}

/** Admin list: only Admitted and Completed rows (hide Lead / Placed / Dropped / Advanced). */
export function isEnrollmentVisibleInAdminList(input: {
  enrollmentStatus: EnrollmentStatus | string;
  studentStatus?: string | null;
}): boolean {
  const workflow = resolveEnrollmentListWorkflowStatus(input);
  return (
    workflow === "ADVANCED" ||
    workflow === "ADMITTED" ||
    workflow === "COMPLETED"
  );
}

/** Admin enrollment popup lifecycle (Admitted / Completed only). */
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



export function getEnrollmentStatusSelectOptions(

  currentEnrollmentStatus: EnrollmentStatus,

): Array<{ label: string; value: EnrollmentStatus }> {

  const lifecycle =

    normalizeEnrollmentRecordLifecycleStatus(currentEnrollmentStatus) ??

    "ADMITTED";

  return getEnrollmentStatusChangeOptions(lifecycle);

}



export function canChangeEnrollmentWorkflowStatus(

  currentEnrollmentStatus: EnrollmentStatus,

): boolean {

  const lifecycle =

    normalizeEnrollmentRecordLifecycleStatus(currentEnrollmentStatus) ??

    "ADMITTED";

  return getEnrollmentStatusChangeOptions(lifecycle).length > 0;

}



export function canChangeSyncedEnrollmentWorkflowStatus(input: {

  enrollmentStatus: EnrollmentStatus | string;

  studentStatus?: string | null;

}): boolean {

  const workflow = resolveSyncedLifecycleWorkflow(input);

  return getEnrollmentStatusChangeOptions(workflow).length > 0;

}



export function isAdmittedWorkflowEnrollment(input: {

  enrollmentStatus: EnrollmentStatus | string;

  studentStatus?: string | null;

  isActive?: boolean;

}): boolean {

  const workflow = resolveEnrollmentListWorkflowStatus(input);

  if (workflow !== "ADMITTED") {
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

  return EnrollmentStatus.ADMITTED;

}



export { ENROLLMENT_RECORD_WORKFLOW_STATUSES, isEnrollmentRecordWorkflowStatus };


