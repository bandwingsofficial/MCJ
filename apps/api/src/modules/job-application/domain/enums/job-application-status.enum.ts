export enum JobApplicationStatus {
  APPLIED = 'APPLIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  ASSESSMENT = 'ASSESSMENT',
  INTERVIEW = 'INTERVIEW',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  PLACED = 'PLACED',
}

/** Statuses that block another application for the same student + job. */
export const JOB_APPLICATION_BLOCKING_STATUSES: readonly JobApplicationStatus[] =
  [
    JobApplicationStatus.APPLIED,
    JobApplicationStatus.UNDER_REVIEW,
    JobApplicationStatus.SHORTLISTED,
    JobApplicationStatus.ASSESSMENT,
    JobApplicationStatus.INTERVIEW,
    JobApplicationStatus.SELECTED,
    JobApplicationStatus.PLACED,
  ];

export function isJobApplicationBlockingStatus(
  status: JobApplicationStatus,
): boolean {
  return JOB_APPLICATION_BLOCKING_STATUSES.includes(status);
}
