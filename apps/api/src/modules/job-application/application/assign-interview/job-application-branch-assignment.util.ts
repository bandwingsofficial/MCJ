import { BadRequestException } from '@nestjs/common';

import { JobApplicationInterviewStatus } from '../../domain/enums/job-application-interview-status.enum';
import { JobApplicationStatus } from '../../domain/enums/job-application-status.enum';

/** Matches Admin-Web `canManageAssignment` — shortlist / interview pipeline only. */
export function canManageBranchInterviewerAssignment(input: {
  status: JobApplicationStatus | string;
  interviewStatus?: JobApplicationInterviewStatus | string | null;
}): boolean {
  const status = String(input.status).trim().toUpperCase() as JobApplicationStatus;

  if (
    status === JobApplicationStatus.REJECTED ||
    status === JobApplicationStatus.PLACED
  ) {
    return false;
  }

  if (
    status === JobApplicationStatus.SHORTLISTED ||
    status === JobApplicationStatus.INTERVIEW
  ) {
    return true;
  }

  if (status === JobApplicationStatus.SELECTED) {
    const interview = String(
      input.interviewStatus ?? JobApplicationInterviewStatus.NOT_YET,
    )
      .trim()
      .toUpperCase();
    return (
      interview === JobApplicationInterviewStatus.NOT_YET || interview === ''
    );
  }

  return false;
}

export function assertCanManageBranchInterviewerAssignment(input: {
  status: JobApplicationStatus | string;
  interviewStatus?: JobApplicationInterviewStatus | string | null;
}): void {
  if (canManageBranchInterviewerAssignment(input)) {
    return;
  }

  throw new BadRequestException(
    'Branch interviewer assignment is only available for shortlisted or in-interview applications.',
  );
}
