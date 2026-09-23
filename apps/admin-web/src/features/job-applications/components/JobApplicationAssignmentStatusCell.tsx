import { JobApplicationAssignmentStatusBadge } from "@/src/features/job-applications/components/JobApplicationAssignmentStatusBadge";
import {
  getAssignedBranchName,
  getAssignedInterviewerName,
  getAssignmentStatus,
  getBranchInterviewerAssignment,
  type JobApplication,
} from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationAssignmentStatusCellProps {
  application: Pick<
    JobApplication,
    "branchInterviewerAssignment" | "interviewAssignment" | "interviews"
  >;
}

export function JobApplicationAssignmentStatusCell({
  application,
}: JobApplicationAssignmentStatusCellProps) {
  const status = getAssignmentStatus(application);

  if (status === "UNASSIGNED") {
    return <JobApplicationAssignmentStatusBadge application={application} />;
  }

  const assignment = getBranchInterviewerAssignment(application);
  const branch = getAssignedBranchName(assignment);
  const interviewer = getAssignedInterviewerName(assignment);

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <JobApplicationAssignmentStatusBadge application={application} />
      <p className="text-xs leading-snug text-[#526581]">
        {branch} · {interviewer}
      </p>
    </div>
  );
}
